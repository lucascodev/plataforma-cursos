import type { StudyCourseSummary } from './study-course-summary.entity';

export interface StudySummary {
  readonly coursesStarted: number;
  readonly studyDays: number;
  readonly projectsDone: number;
  readonly completedItems: number;
  readonly courses: readonly StudyCourseSummary[];
}
