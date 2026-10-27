import { z } from 'zod';
import { codeExerciseSchema } from './code-exercise.schema.ts';
import { deliveryExerciseSchema } from './delivery-exercise.schema.ts';
import { labExerciseSchema } from './lab-exercise.schema.ts';
import { quizExerciseSchema } from './quiz-exercise.schema.ts';
import { reflectionExerciseSchema } from './reflection-exercise.schema.ts';
import { stepsExerciseSchema } from './steps-exercise.schema.ts';

export const exerciseSchema = z.discriminatedUnion('type', [
  deliveryExerciseSchema,
  quizExerciseSchema,
  codeExerciseSchema,
  stepsExerciseSchema,
  reflectionExerciseSchema,
  labExerciseSchema,
]);

export type ExerciseRecord = z.infer<typeof exerciseSchema>;
export type ExerciseType = ExerciseRecord['type'];
