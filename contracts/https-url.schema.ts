import { z } from 'zod';

export const httpsUrlSchema = z
  .string()
  .trim()
  .max(300)
  .url('Link inválido.')
  .refine((value) => value.startsWith('https://'), 'Use links https.');
