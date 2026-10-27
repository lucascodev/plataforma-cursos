import { z } from 'zod';
import { exerciseCommonShape } from './exercise-common.schema.ts';

// Runs in the student's browser, in an isolated runner. Tests travel with the course, so passing them is a check in good
// faith, not proof.
export const codeExerciseSchema = z.object({
  type: z.literal('code'),
  ...exerciseCommonShape,
  language: z.enum(['python', 'javascript', 'sql']),
  starter: z.string().max(20_000),
  tests: z.string().trim().min(1, 'Escreva pelo menos um teste.').max(20_000),
});
