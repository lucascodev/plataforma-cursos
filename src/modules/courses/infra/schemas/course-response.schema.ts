import { z } from 'zod';

export const courseResponseSchema = z.object({ course: z.unknown() });
