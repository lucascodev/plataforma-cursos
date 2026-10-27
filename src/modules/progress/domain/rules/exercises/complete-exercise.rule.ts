import type { CourseProgress } from '../../entities/course-progress.entity';
import { setFlag } from '../updates/set-flag.rule';
import { updateExercise } from './update-exercise.rule';

// Finishing the exercise also marks the lesson as done, so the plan and the percentages count it.
export function completeExercise(progress: CourseProgress, itemKey: string, completed: boolean, now: string): CourseProgress {
  const withExercise = updateExercise(progress, itemKey, (exercise) => ({ ...exercise, completedAt: completed ? now : null }));
  return { ...withExercise, completedItems: setFlag(withExercise.completedItems, itemKey, completed) };
}
