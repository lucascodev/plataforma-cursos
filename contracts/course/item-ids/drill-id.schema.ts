import { z } from 'zod';

export const drillIdSchema = z.string().regex(/^e[a-z0-9]{1,12}$/, 'Use "e" seguido de letras minúsculas ou números.');
