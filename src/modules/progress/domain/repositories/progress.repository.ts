import type { CourseProgress } from '../entities/course-progress.entity';

export interface ProgressRepository {
  load(courseSlug: string): Promise<CourseProgress | null>;
  save(courseSlug: string, progress: CourseProgress): Promise<void>;
  clear(courseSlug: string): Promise<void>;
}
