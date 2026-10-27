import type { z } from 'zod';
import { courseDraftContentSchema } from './course-draft-content.schema.ts';
import { courseVersionSchema } from './course-version.schema.ts';

export const courseVersionWithContentSchema = courseVersionSchema.extend({ content: courseDraftContentSchema });

export type CourseVersionWithContentRecord = z.infer<typeof courseVersionWithContentSchema>;
