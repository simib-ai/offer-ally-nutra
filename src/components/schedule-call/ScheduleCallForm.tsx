import { useEffect, useState, useMemo } from 'react';
import { CheckCircle, Clock, CalendarDays, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import allyNutraLogo from '@/assets/ally-nutra-logo.png';

interface AvailableSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  admin_name: string;
}

// ET date helpers (inlined to avoid import dependency)
const getETTodayStr = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'America/New_York' });

const getETFutureDateStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE', { timeZone: 'America/New_York' });
};

const isSlotBookable = (slotDate: string, startTime: string) => {
  const nowET = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  const [h, m] = startTime.split(':').map(Number);
  const [y, mo, d] = slotDate.split('-').map(Number);
  const slotET = new Date(y, mo - 1, d, h, m);
  return slotET.getTime() - nowET.getTime() > 60 * 60 * 1000; // 1-hour buffer
};

const formatTime = (time: string) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const getEndTime30 = (startTime: string) => {
  const [h, m] = startTime.split(':').map(Number);
  const totalMin = h * 60 + m + 30;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

const ScheduleCallForm = () => {
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [priorityMap, setPriorityMap] = useState<Record<string, number>>({});

  // Contact form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all available (unbooked) slots
  useEffect(() => {
    let cancelled = false;

    const fetchSlots = async () => {
      setLoading(true);

      // 1. Fetch scheduling pool via secure RPC
      const { data: poolData, error: poolError } = await supabase
        .rpc('get_public_scheduling_pool');

      if (cancelled) return;

      if (poolError) {
        console.error('Failed to fetch scheduling pool:', poolError);
        toast.error('Failed to load availability');
        setLoading(false);
        return;
      }

      const map: Record<string, number> = {};
      const poolNames: string[] = [];
      if (poolData) {
        for (const p of poolData) {
          if (!p.admin_name) continue;
          const key = p.admin_name.toLowerCase();
          const existingPriority = map[key];
          if (existingPriority === undefined || p.scheduling_priority < existingPriority) {
            map[key] = p.scheduling_priority;
          }
          if (!poolNames.includes(p.admin_name)) {
            poolNames.push(p.admin_name);
          }
        }
      }
      setPriorityMap(map);

      if (poolNames.length === 0) {
        if (!cancelled) { setSlots([]); setLoading(false); }
        return;
      }

      // 2. Fetch slots for pool members
      const todayStr = getETTodayStr();
      const maxDateStr = getETFutureDateStr(14);

      const { data: slotsData, error: slotsError } = await supabase
        .from('availability_slots')
        .select('id, slot_date, start_time, end_time, admin_name')
        .eq('is_booked', false)
        .gte('slot_date', todayStr)
        .lte('slot_date', maxDateStr)
        .in('admin_name', poolNames)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (cancelled) return;

      if (slotsError) {
        console.error('Failed to fetch slots:', slotsError);
        toast.error('Failed to load availability');
        setLoading(false);
        return;
      }

      const rawData = (slotsData || []) as AvailableSlot[];
      const filtered = rawData.filter(slot => isSlotBookable(slot.slot_date, slot.start_time));
      setSlots(filtered);
      setLoading(false);
    };

    fetchSlots();
    return () => { cancelled = true; };
  }, []);

  // Helper: compute bookable slots for a given date string
  const getBookableSlotsForDate = (dateStr: string) => {
    const dateSlots = slots.filter(s => s.slot_date === dateStr);
    const seen = new Map<string, AvailableSlot>();

    const candidates: AvailableSlot[] = [];
    for (const slot of dateSlots) {
      if (!isSlotBookable(dateStr, slot.start_time)) continue;
      const nextStart = slot.end_time;
      const hasNext = dateSlots.some(
        s => s.admin_name === slot.admin_name && s.start_time === nextStart
      );
      if (hasNext) {
        candidates.push(slot);
      }
    }

    // Deduplicate by start_time, keeping highest-priority specialist (lowest number)
    for (const slot of candidates) {
      const existing = seen.get(slot.start_time);
      if (!existing) {
        seen.set(slot.start_time, slot);
      } else {
        const existingPriority = priorityMap[existing.admin_name.toLowerCase()] ?? 5;
        const newPriority = priorityMap[slot.admin_name.toLowerCase()] ?? 5;
        if (newPriority < existingPriority) {
          seen.set(slot.start_time, slot);
        }
      }
    }

    return Array.from(seen.values());
  };

  // Dates that have bookable slots
  const availableDates = useMemo(() => {
    const dateSet = new Set(slots.map(s => s.slot_date));
    return Array.from(dateSet)
      .filter(d => getBookableSlotsForDate(d).length > 0)
      .map(d => new Date(d + 'T00:00:00'));
  }, [slots, priorityMap]);

  const availableDateStrs = useMemo(() => {
    return new Set(availableDates.map(d => format(d, 'yyyy-MM-dd')));
  }, [availableDates]);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return getBookableSlotsForDate(dateStr);
  }, [slots, selectedDate, priorityMap]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) setStep(2);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('book-appointment', {
        body: {
          slot_id: selectedSlot.id,
          full_name: fullName,
          email,
          phone,
          company_name: company || undefined,
          notes: message.trim() || undefined,
          client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          is_individual_link: false,
          lead_source: 'Campaign',
        },
      });

      let result = data;
      if (error) {
        try {
          const ctx = (error as unknown as { context?: { json?: () => Promise<unknown>; text?: () => Promise<string> } }).context;
          if (ctx?.json) {
            result = await ctx.json();
          } else if (ctx?.text) {
            const text = await ctx.text();
            try { result = JSON.parse(text); } catch { result = { error: text }; }
          }
        } catch {
          // fall through
        }
        if (!result?.error) throw error;
      }

      if (result?.error) {
        toast.error(result.error);
        if (result.error.includes('no longer available')) {
          setStep(2);
          setSelectedSlot(null);
          // Refresh slots
          const refreshToday = getETTodayStr();
          const refreshMax = getETFutureDateStr(14);
          const { data: refreshed } = await supabase
            .from('availability_slots')
            .select('id, slot_date, start_time, end_time, admin_name')
            .eq('is_booked', false)
            .gte('slot_date', refreshToday)
            .lte('slot_date', refreshMax)
            .order('slot_date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(5000);
          setSlots(((refreshed || []) as AvailableSlot[]).filter(s => isSlotBookable(s.slot_date, s.start_time)));
        }
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">You're Booked!</h2>
          <p className="text-muted-foreground mb-2">Your discovery call has been scheduled successfully.</p>
          <p className="text-sm text-muted-foreground mb-6">Check your email for confirmation details.</p>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setSelectedDate(undefined);
              setSelectedSlot(null);
              setFullName('');
              setEmail('');
              setPhone('');
              setCompany('');
              setMessage('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="mx-auto block cursor-pointer bg-transparent border-none p-0"
          >
            <img src={allyNutraLogo} alt="Ally Nutra" className="h-10" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${s === step ? 'bg-primary text-primary-foreground' : s < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary/40' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Back button */}
      {step > 1 && (
        <Button
          variant="ghost"
          onClick={() => setStep(step - 1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      {/* Step 1: Pick a Date */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Select a Date</h2>
            </div>
            {loading ? (
              <p className="text-muted-foreground text-center py-12">Loading availability…</p>
            ) : availableDates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No availability at this time.</p>
                <p className="text-sm text-muted-foreground">Please check back soon or contact us directly.</p>
              </div>
            ) : (
              <div className="w-full">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return !availableDateStrs.has(dateStr);
                  }}
                  fromDate={new Date()}
                  toDate={(() => { const d = new Date(); d.setDate(d.getDate() + 14); return d; })()}
                  className="rounded-md w-full"
                  classNames={{
                    months: 'flex flex-col w-full',
                    month: 'space-y-4 w-full',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-sm font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse',
                    head_row: 'flex w-full',
                    head_cell: 'text-muted-foreground rounded-md flex-1 font-normal text-sm text-center',
                    row: 'flex w-full mt-2',
                    cell: 'flex-1 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex items-center justify-center',
                    day: 'h-9 w-9 p-0 font-normal rounded-full inline-flex items-center justify-center aria-selected:opacity-100 hover:bg-accent transition-colors',
                    day_today: '!bg-ally-navy !text-white !rounded-full',
                    day_selected: '!bg-ally-orange !text-white !rounded-full',
                    day_outside: 'text-muted-foreground opacity-50',
                    day_disabled: 'text-muted-foreground opacity-50',
                    day_hidden: 'invisible',
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pick a Time */}
      {step === 2 && selectedDate && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Pick a Time</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            {slotsForDate.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slotsForDate.map(slot => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    className="h-auto py-3"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <span className="font-semibold">{formatTime(slot.start_time)}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && selectedSlot && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Information</h2>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 mb-6 text-sm">
              <p className="font-medium">{selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-muted-foreground">{formatTime(selectedSlot.start_time)} – {formatTime(getEndTime30(selectedSlot.start_time))} ET</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Your company"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="What would you like to discuss on the call? e.g. product formulation, pricing, timelines…"
                  className="min-h-[100px]"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Booking…' : 'Confirm Call'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleCallForm;
