import type { ExerciseProgress } from '@/modules/progress';
import type { Exercise } from '../../entities/course/module/exercise/exercise.entity';
import { SOLUTION_ATTEMPTS } from './solution-attempts';

export function isSolutionRevealed(exercise: Exercise, state: ExerciseProgress): boolean {
  if (!exercise.solution) return false;
  switch (exercise.solution.reveal) {
    case 'after-done':
      return state.completedAt !== null;
    case 'after-attempts':
      return state.completedAt !== null || state.attempts >= SOLUTION_ATTEMPTS;
    case 'never':
      return false;
  }
}
