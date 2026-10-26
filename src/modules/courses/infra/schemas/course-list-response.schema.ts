import { z } from 'zod';

export const courseListResponseSchema = z.object({ courses: z.array(z.unknown()).max(200) });
