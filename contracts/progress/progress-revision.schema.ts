import { z } from 'zod';

export const progressRevisionSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
