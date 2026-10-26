import { z } from 'zod';

export const courseListingSchema = z.object({ listed: z.boolean() });

export type CourseListingRecord = z.infer<typeof courseListingSchema>;
