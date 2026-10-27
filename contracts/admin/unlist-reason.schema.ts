import { z } from 'zod';

export const unlistReasonSchema = z.enum(['outdated', 'quality', 'teacher-request', 'reported', 'other']);

export type UnlistReason = z.infer<typeof unlistReasonSchema>;
