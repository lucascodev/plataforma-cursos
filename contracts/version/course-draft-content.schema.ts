import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';

// A draft may be incomplete, so only the slug is checked here. The full course schema runs before sending and again
// before publishing; the request body limit keeps the size in check.
export const courseDraftContentSchema = z.looseObject({ slug: courseSlugSchema });

export type CourseDraftContentRecord = z.infer<typeof courseDraftContentSchema>;
