import { z } from 'zod';
import { labCodeSchema } from '../course/exercise/lab-code.schema.ts';

// An empty code removes the registered one.
export const labCodeUpdateSchema = z.object({ code: z.literal('').or(labCodeSchema) });
