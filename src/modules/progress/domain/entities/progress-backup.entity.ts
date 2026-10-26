import type { CourseProgress } from './course-progress.entity';

export interface ProgressBackup {
  readonly format: 'cursos-abertos/progresso';
  readonly version: 1;
  readonly courseSlug: string;
  readonly exportedAt: string;
  readonly progress: CourseProgress;
}
