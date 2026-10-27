import { z } from 'zod';

// Parts of an exercise (questions, options, steps, checks) keep a stable id, like lessons, so progress survives edits.
export const exercisePartIdSchema = (prefix: 'q' | 'o' | 'p' | 'c') =>
  z.string().regex(new RegExp(`^${prefix}[a-z0-9]{1,12}$`), 'Id inválido.');
