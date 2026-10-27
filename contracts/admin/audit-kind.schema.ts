import { z } from 'zod';

export const auditKindSchema = z.enum(['courses', 'proposals', 'people']);

export type AuditKind = z.infer<typeof auditKindSchema>;
