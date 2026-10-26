import type { CourseProgress } from '../../../domain/entities/course-progress.entity';
import type { ProgressSnapshot } from '../../../domain/entities/progress-snapshot.entity';

export interface SaveProgressInputDto {
  readonly courseSlug: string;
  readonly progress: CourseProgress;
  readonly base: ProgressSnapshot;
}
