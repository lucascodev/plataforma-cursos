import type { EditableExercise } from '../../entities/draft/editable-exercise.entity';
import { createItemId } from '../draft/create-item-id.rule';
import { createQuizOption } from './create-quiz-option.rule';
import { idsOf } from './ids-of';

type QuizQuestion = Extract<EditableExercise, { type: 'quiz' }>['questions'][number];

// A question starts with the two options the schema asks for, the first one marked as right.
export function createQuizQuestion(questions: readonly QuizQuestion[], random: () => number): QuizQuestion {
  const first = createQuizOption([], random);
  const second = createQuizOption([first], random);
  return { id: createItemId('q', idsOf(questions), random), text: '', options: [first, second], correct: first.id };
}
