import type { CourseProgress } from './course-progress.entity';

export interface ProgressSnapshot {
  readonly progress: CourseProgress;
  readonly revision: number;
}
