import { z } from 'zod';

export const lessonIdSchema = z.string().regex(/^t[a-z0-9]{1,12}$/, 'Use "t" seguido de letras minúsculas ou números.');
