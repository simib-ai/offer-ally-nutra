import { format } from 'date-fns';
import type { QuoteFormData } from '@/types/quoteForm';
import type { ScheduleCallFormValues } from '@/types/scheduleCallForm';

export function buildScheduleCallQuotePayload(
  values: ScheduleCallFormValues,
  attachmentNames: string[]
): QuoteFormData {
  const dateStr = format(values.meetingDate, 'EEEE, MMMM d, yyyy');
  const lines = [
    '[Lead type: Schedule a Call]',
    `Preferred time:\n${dateStr}\n${values.timeSlot}`,
  ];
  if (values.message?.trim()) {
    lines.push(`Discussion topics: ${values.message.trim()}`);
  }
  if (attachmentNames.length > 0) {
    lines.push(`Attached file names (not uploaded via form): ${attachmentNames.join(', ')}`);
  }

  return {
    supplementType: 'Schedule a Call',
    quantity: values.quantityRange,
    formulationStatus: 'general_idea',
    deliveryFormat: 'unspecified',
    ingredients: [
      { id: crypto.randomUUID(), name: 'Call scheduling request', amount: '', unit: 'mg' },
    ],
    servingSize: '',
    servingsPerContainer: '',
    materialType: '',
    unitsPerBox: '',
    netWeight: '',
    packageDimensions: '',
    includeDisplayBox: false,
    labelsProvidedBy: '',
    graphicDesignBy: '',
    additionalComments: lines.join('\n\n'),
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    company: values.company?.trim() ?? '',
    marketingConsent: false,
    emailConsent: false,
  };
}
