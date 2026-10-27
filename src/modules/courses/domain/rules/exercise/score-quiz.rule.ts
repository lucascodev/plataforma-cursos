import type { ExerciseProgress } from '@/modules/progress';
import type { Exercise } from '../../entities/course/module/exercise/exercise.entity';

type Quiz = Extract<Exercise, { type: 'quiz' }>;

export interface QuizScore {
  readonly correct: number;
  readonly total: number;
  readonly needed: number;
  readonly answered: number;
  readonly passed: boolean;
}

export function scoreQuiz(quiz: Quiz, answers: ExerciseProgress['answers']): QuizScore {
  const correct = quiz.questions.filter((question) => answers[question.id] === question.correct).length;
  const needed = quiz.passing ?? quiz.questions.length;
  return {
    correct,
    total: quiz.questions.length,
    needed,
    answered: quiz.questions.filter((question) => question.id in answers).length,
    passed: correct >= needed,
  };
}
