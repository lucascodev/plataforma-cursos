import { z } from 'zod';

export const courseVersionStatusSchema = z.enum(['draft', 'in_review', 'changes_requested', 'published', 'superseded']);

export type CourseVersionStatus = z.infer<typeof courseVersionStatusSchema>;
