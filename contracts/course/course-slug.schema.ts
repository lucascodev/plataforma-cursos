import { z } from 'zod';

export const courseSlugSchema = z.string().regex(/^[a-z0-9-]{1,60}$/, 'Use letras minúsculas, números e hífens.');
