import { z } from 'zod';
import { exerciseText } from './exercise-text.ts';

// Fields every kind of exercise has. The solution is published with the course: it is a study aid, not a secret.
export const exerciseCommonShape = {
  prompt: exerciseText(1200),
  estimatedMinutes: z.number().int().min(5).max(600).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  hints: z.array(exerciseText(400)).max(5).optional(),
  doneCriteria: z.array(exerciseText(300)).max(10).optional(),
  stuckTips: z.array(exerciseText(400)).max(5).optional(),
  solution: z
    .object({
      text: z.string().trim().min(1).max(8000),
      reveal: z.enum(['after-done', 'after-attempts', 'never']),
    })
    .optional(),
};
