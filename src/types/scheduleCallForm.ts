import { z } from 'zod';

export const scheduleCallFormSchema = z.object({
  meetingDate: z.date({ required_error: 'Please select a date' }),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().optional(),
  quantityRange: z.string().min(1, 'Please select a quantity range'),
  message: z.string().optional(),
});

export type ScheduleCallFormValues = z.infer<typeof scheduleCallFormSchema>;
