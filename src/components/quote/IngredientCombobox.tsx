import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface IngredientComboboxProps {
  value: string;
  onSelect: (name: string) => void;
  ingredientNames: string[];
  disabled?: boolean;
  className?: string;
}

export function IngredientCombobox({
  value,
  onSelect,
  ingredientNames,
  disabled = false,
  className,
}: IngredientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.toLowerCase();
  const filteredNames = searchQuery
    ? ingredientNames.filter((n) => n.toLowerCase().includes(q))
    : ingredientNames;

  const queryMatchesExisting = searchQuery
    ? ingredientNames.some((n) => n.toLowerCase() === q)
    : false;

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearchQuery(''); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-9 w-full justify-between text-sm font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">
            {value || 'Select ingredient…'}
          </span>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search ingredients…"
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {searchQuery.length < 1 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type to search ingredients…
              </div>
            ) : (
              <>
                {filteredNames.length > 0 && (
                  <CommandGroup>
                    {filteredNames.map((name) => (
                      <CommandItem
                        key={name}
                        value={name}
                        onSelect={() => {
                          onSelect(name === value ? '' : name);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value?.toLowerCase() === name.toLowerCase() ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {!queryMatchesExisting && (
                  <>
                    {filteredNames.length > 0 && <CommandSeparator />}
                    <CommandGroup>
                      <CommandItem
                        value={`__custom__${searchQuery}`}
                        onSelect={() => { onSelect(searchQuery); setOpen(false); }}
                      >
                        <Plus className="mr-2 h-4 w-4 shrink-0" />
                        Use &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo; as custom
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
