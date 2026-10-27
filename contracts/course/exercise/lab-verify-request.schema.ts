import { z } from 'zod';
import { labCodeSchema } from './lab-code.schema.ts';

export const labVerifyRequestSchema = z.object({ code: labCodeSchema });
