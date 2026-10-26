import { courseAuthorSchema } from '@contracts/course/course-author.schema';
import { z } from 'zod';

export const courseResponseSchema = z.object({ course: z.unknown(), author: courseAuthorSchema.nullable().catch(null) });
