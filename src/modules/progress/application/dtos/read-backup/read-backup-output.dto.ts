import type { CourseProgress } from '../../../domain/entities/course-progress.entity';

export interface ReadBackupOutputDto {
  readonly progress: CourseProgress;
  readonly exportedAt: string;
  readonly completedItems: number;
  readonly studyDays: number;
  readonly journalEntries: number;
}
