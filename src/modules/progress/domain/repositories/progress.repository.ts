import type { CourseProgress } from '../entities/course-progress.entity';
import type { ProgressSnapshot } from '../entities/progress-snapshot.entity';
import type { ProgressSummary } from '../entities/progress-summary.entity';

export interface ProgressRepository {
  load(courseSlug: string): Promise<ProgressSnapshot | null>;
  // Resolves with the new revision; rejects with ProgressConflictError when the stored revision is no longer baseRevision.
  save(courseSlug: string, progress: CourseProgress, baseRevision: number): Promise<number>;
  clear(courseSlug: string): Promise<void>;
  listSummaries(): Promise<ProgressSummary[]>;
}
