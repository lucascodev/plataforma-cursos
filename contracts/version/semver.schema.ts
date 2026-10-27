import { z } from 'zod';

export const semverSchema = z.string().regex(/^\d{1,4}\.\d{1,4}\.\d{1,4}$/);
