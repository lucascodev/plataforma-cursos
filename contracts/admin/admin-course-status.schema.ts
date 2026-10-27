import { z } from 'zod';

export const adminCourseStatusSchema = z.enum(['published', 'review', 'draft', 'unlisted']);

export type AdminCourseStatus = z.infer<typeof adminCourseStatusSchema>;
