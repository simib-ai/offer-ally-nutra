import { useState, useCallback, useEffect } from 'react';
import { Globe, ImageIcon, Link2, Upload, X, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParsedIngredient {
  name: string;
  amount: number;
  unit: string;
}

interface ProductAutoFillProps {
  onParsedIngredients: (ingredients: ParsedIngredient[]) => void;
  onServingInfo: (servingSize: string | null, servingsPerContainer: number | null) => void;
}

type Mode = 'url' | 'image';

const LOADING_MESSAGES_URL = [
  'Connecting to product page…',
  'Fetching supplement facts…',
  'Extracting ingredients…',
  'Processing product info…',
  'Almost done…',
];
const LOADING_MESSAGES_IMAGE = [
  'Connecting to AI…',
  'Analyzing label image…',
  'Extracting supplement facts…',
  'Processing ingredients…',
  'Almost done…',
];

async function compressImageToBase64(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProductAutoFill({ onParsedIngredients, onServingInfo }: ProductAutoFillProps) {
  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading) { setMsgIndex(0); return; }
    const msgs = mode === 'image' ? LOADING_MESSAGES_IMAGE : LOADING_MESSAGES_URL;
    const t = setInterval(() => setMsgIndex((p) => (p + 1) % msgs.length), 2500);
    return () => clearInterval(t);
  }, [isLoading, mode]);

  const reset = () => { setSuccess(false); setError(null); setCount(null); };
  const resetAll = () => { reset(); setUrl(''); setImages([]); };
  const switchMode = (m: Mode) => { setMode(m); reset(); };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    reset();
    const valid: { file: File; preview: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) { setError('Please upload image files only (JPG, PNG, etc.)'); continue; }
      if (f.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); continue; }
      valid.push({ file: f, preview: URL.createObjectURL(f) });
    }
    setImages((prev) => [...prev, ...valid].slice(0, 5));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (i: number) => {
    setImages((prev) => { const n = [...prev]; URL.revokeObjectURL(n[i].preview); n.splice(i, 1); return n; });
    reset();
  };

  const analyzeUrl = async () => {
    if (!url.trim()) { setError('Please enter a product URL'); return; }
    setIsLoading(true); setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('extract-product-from-url', {
        body: { url: url.trim() },
      });
      if (fnErr) throw new Error(fnErr.message || 'Failed to analyze product');
      if (!data?.success) throw new Error(data?.error || 'Failed to extract product information');
      if (data?.parsedIngredients?.length) {
        onParsedIngredients(data.parsedIngredients);
        if (data.servingSize || data.servingsPerContainer)
          onServingInfo(data.servingSize || null, data.servingsPerContainer || null);
        setCount(data.ingredientCount || data.parsedIngredients.length);
        setSuccess(true);
        toast.success('Supplement facts extracted from product page');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze URL';
      setError(msg); toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeImages = async () => {
    if (!images.length) { setError('Please upload at least one label image'); return; }
    setIsLoading(true); setError(null);
    try {
      const compressed = await Promise.all(images.map((img) => compressImageToBase64(img.file)));
      const { data, error: fnErr } = await supabase.functions.invoke('extract-label-ingredients', {
        body: { images: compressed, storeImages: false },
      });
      if (fnErr) throw new Error(fnErr.message || 'Failed to analyze label');
      if (data?.error) throw new Error(data.error);
      if (data?.parsedIngredients?.length) {
        onParsedIngredients(data.parsedIngredients);
        if (data.servingSize || data.servingsPerContainer)
          onServingInfo(data.servingSize || null, data.servingsPerContainer || null);
        setCount(data.ingredientCount || data.parsedIngredients.length);
        setSuccess(true);
        toast.success('Ingredients extracted from label');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze label';
      setError(msg); toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const msgs = mode === 'image' ? LOADING_MESSAGES_IMAGE : LOADING_MESSAGES_URL;

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-muted bg-muted/10 p-3 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Optional Shortcut</span>
        <span className="text-[10px] px-1.5 py-0 h-4 inline-flex items-center bg-secondary text-secondary-foreground rounded">Skip if not needed</span>
      </div>

      <div className="flex items-start gap-2.5">
        <div className="rounded-full bg-muted p-1.5">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-normal text-muted-foreground">Auto-Fill from Existing Product (Optional)</p>
          <p className="text-xs text-muted-foreground/80">Skip this if you've already entered your ingredients above. Upload a label image or paste a product URL to auto-fill.</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button type="button" variant={mode === 'url' ? 'default' : 'outline'} size="sm"
          onClick={() => switchMode('url')} className="flex-1 h-9 text-xs">
          <Link2 className="mr-1.5 h-3.5 w-3.5" />Paste URL
        </Button>
        <Button type="button" variant={mode === 'image' ? 'default' : 'outline'} size="sm"
          onClick={() => switchMode('image')} className="flex-1 h-9 text-xs">
          <ImageIcon className="mr-1.5 h-3.5 w-3.5" />Upload Image
        </Button>
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://www.amazon.com/product/..."
              value={url}
              onChange={(e) => { setUrl(e.target.value); reset(); }}
              className="pl-10 h-11"
            />
          </div>
          {!url.trim() && (
            <p className="text-xs text-muted-foreground">Supported: Amazon, iHerb, Walmart, Vitacost, brand websites, and more</p>
          )}
          {url.trim() && !success && (
            <Button type="button" onClick={analyzeUrl} disabled={isLoading} className="w-full h-11">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{msgs[msgIndex]}</> : <><Globe className="mr-2 h-4 w-4" />Analyze Product</>}
            </Button>
          )}
        </div>
      )}

      {/* Image mode */}
      {mode === 'image' && (
        <div className="space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
          >
            <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground/70">JPG, PNG · Max 10 MB · Up to 5 images</p>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                  <img src={img.preview} alt={`Label ${i + 1}`} className="h-full w-full object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && !success && (
            <Button type="button" onClick={analyzeImages} disabled={isLoading} className="w-full h-11">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{msgs[msgIndex]}</> : <><ImageIcon className="mr-2 h-4 w-4" />Analyze Label</>}
            </Button>
          )}
        </div>
      )}

      {isLoading && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">Usually takes 5–15 seconds</p>
      )}

      {error && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
          </div>
          <Button type="button" variant="outline" size="sm"
            onClick={mode === 'url' ? analyzeUrl : analyzeImages} className="text-xs h-8">
            <RotateCcw className="h-3 w-3 mr-1" />Retry
          </Button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Extracted{count ? ` ${count} ingredients` : ' ingredients'} — form updated above</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={resetAll} className="text-xs h-8 text-muted-foreground">
            <RotateCcw className="h-3 w-3 mr-1" />Clear
          </Button>
        </div>
      )}
    </div>
  );
}
