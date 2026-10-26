import { z } from 'zod';
import { courseProgressSchema } from '@contracts/progress/course-progress.schema';
import { progressRevisionSchema } from '@contracts/progress/progress-revision.schema';

export const progressResponseSchema = z.object({ progress: courseProgressSchema.nullable(), revision: progressRevisionSchema });
