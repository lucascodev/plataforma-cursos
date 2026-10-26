import { z } from 'zod';
import { courseProgressSchema } from '@contracts/course-progress.schema';

export const progressResponseSchema = z.object({ progress: courseProgressSchema.nullable() });
