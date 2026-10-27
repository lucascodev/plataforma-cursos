import { z } from 'zod';

export const exerciseText = (max: number) => z.string().trim().min(1).max(max);
