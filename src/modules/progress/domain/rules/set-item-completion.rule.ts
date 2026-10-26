import type { CourseProgress } from '../entities/course-progress.entity';
import { setFlag } from './set-flag.rule';

export function setItemCompletion(progress: CourseProgress, itemId: string, completed: boolean): CourseProgress {
  return { ...progress, completedItems: setFlag(progress.completedItems, itemId, completed) };
}
