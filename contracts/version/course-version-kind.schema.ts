import { z } from 'zod';

// "first" is the first publication (always 1.0.0); the others say which number of the version goes up.
export const courseVersionKindSchema = z.enum(['first', 'patch', 'minor', 'major']);

export const submittableVersionKindSchema = courseVersionKindSchema.exclude(['first']);

export type CourseVersionKind = z.infer<typeof courseVersionKindSchema>;
