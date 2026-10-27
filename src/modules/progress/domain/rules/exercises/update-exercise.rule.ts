import type { CourseProgress } from '../../entities/course-progress.entity';
import type { ExerciseProgress } from '../../entities/exercise-progress.entity';
import { EMPTY_EXERCISE_PROGRESS } from './empty-exercise-progress.rule';

export function updateExercise(
  progress: CourseProgress,
  itemKey: string,
  change: (current: ExerciseProgress) => ExerciseProgress,
): CourseProgress {
  const current = progress.exercises[itemKey] ?? EMPTY_EXERCISE_PROGRESS;
  const next = change(current);
  if (next === current) return progress;
  return { ...progress, exercises: { ...progress.exercises, [itemKey]: next } };
}
