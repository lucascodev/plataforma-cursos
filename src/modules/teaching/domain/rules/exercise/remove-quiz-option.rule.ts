import type { EditableExercise } from '../../entities/draft/editable-exercise.entity';

type QuizQuestion = Extract<EditableExercise, { type: 'quiz' }>['questions'][number];

// Removing the right option moves the mark to the first one left, so the question never points to a missing option.
export function removeQuizOption(question: QuizQuestion, index: number): QuizQuestion {
  const options = question.options.filter((_, position) => position !== index);
  const isCorrectKept = options.some((option) => option.id === question.correct);
  return { ...question, options, correct: isCorrectKept ? question.correct : (options[0]?.id ?? question.correct) };
}
