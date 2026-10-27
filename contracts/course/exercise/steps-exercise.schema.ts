import { z } from 'zod';
import { exerciseCommonShape } from './exercise-common.schema.ts';
import { exercisePartIdSchema } from './exercise-part-id.schema.ts';
import { exerciseText } from './exercise-text.ts';
import { hasUniqueIds } from './has-unique-ids.ts';

export const stepsExerciseSchema = z
  .object({
    type: z.literal('steps'),
    ...exerciseCommonShape,
    steps: z
      .array(
        z.object({
          id: exercisePartIdSchema('p'),
          title: exerciseText(200),
          detail: exerciseText(800).optional(),
          code: z.string().max(4000).optional(),
        }),
      )
      .min(1)
      .max(20),
  })
  .refine((exercise) => hasUniqueIds(exercise.steps), { message: 'Há passos com o mesmo id.', path: ['steps'] });
