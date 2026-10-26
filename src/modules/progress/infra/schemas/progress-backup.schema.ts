import { z } from 'zod';
import { courseProgressSchema } from '@contracts/progress/course-progress.schema';

export const progressBackupSchema = z.object({
  format: z.literal('cursos-abertos/progresso'),
  version: z.literal(1),
  courseSlug: z.string().regex(/^[a-z0-9-]{1,60}$/),
  exportedAt: z.string().max(40),
  progress: courseProgressSchema,
});

export type ProgressBackupRecord = z.infer<typeof progressBackupSchema>;
