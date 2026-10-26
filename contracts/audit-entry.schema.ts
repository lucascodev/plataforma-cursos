import { z } from 'zod';
import { profileCardSchema } from './profile-card.schema';
import { timestampSchema } from './timestamp.schema';

export const auditActionSchema = z.enum([
  'proposal.submitted',
  'proposal.approved',
  'proposal.changes_requested',
  'proposal.refused',
  'proposal.withdrawn',
  'role.changed',
  'course.owner_changed',
  'course.listed',
  'course.unlisted',
  'course.deleted',
]);

export const auditEntrySchema = z.object({
  id: z.number().int(),
  at: timestampSchema,
  action: auditActionSchema,
  targetType: z.enum(['proposal', 'profile', 'course']),
  targetId: z.string().max(100),
  targetLabel: z.string().max(200).nullable(),
  data: z.record(z.string(), z.unknown()),
  actor: profileCardSchema.nullable(),
});

export type AuditEntryRecord = z.infer<typeof auditEntrySchema>;
