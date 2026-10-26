import type { CourseProgress } from '../../../domain/entities/course-progress.entity';

export interface LoadProgressOutputDto {
  readonly progress: CourseProgress;
}
