import type { EditableExercise } from '../../entities/draft/editable-exercise.entity';
import { createItemId } from '../draft/create-item-id.rule';
import { idsOf } from './ids-of';

type QuizOption = Extract<EditableExercise, { type: 'quiz' }>['questions'][number]['options'][number];

export function createQuizOption(options: readonly QuizOption[], random: () => number): QuizOption {
  return { id: createItemId('o', idsOf(options), random), text: '' };
}
