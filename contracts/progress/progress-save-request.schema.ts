import { z } from 'zod';
import { courseProgressSchema } from './course-progress.schema.ts';
import { progressRevisionSchema } from './progress-revision.schema.ts';

// No baseRevision means a tab running code from before revisions existed: the server merges without checking.
export const progressSaveRequestSchema = z.object({
  progress: courseProgressSchema,
  baseRevision: progressRevisionSchema.nullable().optional(),
});

export type ProgressSaveRequestRecord = z.infer<typeof progressSaveRequestSchema>;
