import type { ExerciseProgress } from '../../entities/exercise-progress.entity';

export const EMPTY_EXERCISE_PROGRESS: ExerciseProgress = {
  stepsDone: [],
  criteriaDone: [],
  answers: {},
  attempts: 0,
  passedChecks: [],
  hintsOpened: 0,
  code: null,
  files: {},
  deliveryUrl: null,
  deliveryText: '',
  completedAt: null,
};
