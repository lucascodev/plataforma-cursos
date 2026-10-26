import type { CourseProgress } from '../../../domain/entities/course-progress.entity';

export interface SaveProgressInputDto {
  readonly courseSlug: string;
  readonly progress: CourseProgress;
}
