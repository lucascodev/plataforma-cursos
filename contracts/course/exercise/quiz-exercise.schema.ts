import { z } from 'zod';
import { exerciseCommonShape } from './exercise-common.schema.ts';
import { exercisePartIdSchema } from './exercise-part-id.schema.ts';
import { exerciseText } from './exercise-text.ts';
import { hasUniqueIds } from './has-unique-ids.ts';

const quizQuestionSchema = z
  .object({
    id: exercisePartIdSchema('q'),
    text: exerciseText(400),
    options: z.array(z.object({ id: exercisePartIdSchema('o'), text: exerciseText(200) })).min(2).max(6),
    correct: exercisePartIdSchema('o'),
    explanation: exerciseText(600).optional(),
  })
  .refine((question) => question.options.some((option) => option.id === question.correct), {
    message: 'Marque qual opção está certa.',
    path: ['correct'],
  })
  .refine((question) => hasUniqueIds(question.options), { message: 'Há opções com o mesmo id.', path: ['options'] });

export const quizExerciseSchema = z
  .object({
    type: z.literal('quiz'),
    ...exerciseCommonShape,
    questions: z.array(quizQuestionSchema).min(1).max(20),
    // Right answers needed to complete. Missing: all of them.
    passing: z.number().int().min(1).max(20).optional(),
  })
  .refine((quiz) => hasUniqueIds(quiz.questions), { message: 'Há perguntas com o mesmo id.', path: ['questions'] })
  .refine((quiz) => (quiz.passing ?? quiz.questions.length) <= quiz.questions.length, {
    message: 'O mínimo de acertos passa do número de perguntas.',
    path: ['passing'],
  });
