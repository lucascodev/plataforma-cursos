import { z } from 'zod';

export const timestampSchema = z.string().min(1).max(40);
