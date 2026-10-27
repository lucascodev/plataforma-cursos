import { z } from 'zod';
import { exerciseCommonShape } from './exercise-common.schema.ts';

export const deliveryExerciseSchema = z.object({
  type: z.literal('delivery'),
  ...exerciseCommonShape,
  deliver: z.enum(['link', 'text', 'link-and-text']),
});
