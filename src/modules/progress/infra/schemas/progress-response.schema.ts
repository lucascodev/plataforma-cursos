import { z } from 'zod';
import { courseProgressSchema } from '@contracts/progress/course-progress.schema';

export const progressResponseSchema = z.object({ progress: courseProgressSchema.nullable() });
