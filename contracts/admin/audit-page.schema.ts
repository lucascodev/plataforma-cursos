import { z } from 'zod';
import { auditEntrySchema } from './audit-entry.schema.ts';

export const auditPageSchema = z.object({
  items: z.array(auditEntrySchema).max(100),
  nextBefore: z.number().int().nullable(),
});

export type AuditPageRecord = z.infer<typeof auditPageSchema>;
