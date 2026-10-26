import { z } from 'zod';
import { isTimeZone } from './is-time-zone.ts';

export const accountSettingsSchema = z.object({
  timezone: z
    .string()
    .max(64)
    .regex(/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/, 'Fuso horário inválido.')
    .refine(isTimeZone, 'Fuso horário inválido.'),
  theme: z.enum(['system', 'light', 'dark']),
  notify: z.object({ proposalUpdates: z.boolean(), weeklySummary: z.boolean() }),
});

export type AccountSettingsRecord = z.infer<typeof accountSettingsSchema>;
