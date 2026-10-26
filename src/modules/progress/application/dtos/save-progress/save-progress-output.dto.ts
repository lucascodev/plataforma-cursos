import type { CourseProgress } from '../../../domain/entities/course-progress.entity';

export interface SaveProgressOutputDto {
  readonly progress: CourseProgress;
  readonly revision: number;
}
