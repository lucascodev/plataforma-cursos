import { z } from 'zod';
import { exerciseCommonShape } from './exercise-common.schema.ts';
import { exerciseText } from './exercise-text.ts';

export const reflectionExerciseSchema = z.object({
  type: z.literal('reflection'),
  ...exerciseCommonShape,
  question: exerciseText(600),
});
