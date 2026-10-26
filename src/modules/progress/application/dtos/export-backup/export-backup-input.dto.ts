import type { CourseProgress } from '../../../domain/entities/course-progress.entity';

export interface ExportBackupInputDto {
  readonly courseSlug: string;
  readonly progress: CourseProgress;
}
