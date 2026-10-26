import type { CourseProgress } from '../../domain/entities/course-progress.entity';
import type { ProgressSnapshot } from '../../domain/entities/progress-snapshot.entity';
import type { ProgressSummary } from '../../domain/entities/progress-summary.entity';
import { ProgressConflictError } from '../../domain/errors/progress-conflict.error';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';

export class InMemoryProgressRepository implements ProgressRepository {
  private readonly records = new Map<string, ProgressSnapshot>();

  async load(courseSlug: string): Promise<ProgressSnapshot | null> {
    return this.records.get(courseSlug) ?? null;
  }

  async save(courseSlug: string, progress: CourseProgress, baseRevision: number): Promise<number> {
    const stored = this.records.get(courseSlug);
    if (stored && stored.revision !== baseRevision) throw new ProgressConflictError();
    const revision = (stored?.revision ?? 0) + 1;
    this.records.set(courseSlug, { progress, revision });
    return revision;
  }

  async clear(courseSlug: string): Promise<void> {
    this.records.delete(courseSlug);
  }

  async listSummaries(): Promise<ProgressSummary[]> {
    return [...this.records].map(([courseSlug, { progress }]) => ({
      courseSlug,
      updatedAt: progress.updatedAt ?? '',
      completedItemIds: Object.keys(progress.completedItems),
      studyDayCount: Object.keys(progress.studyDays).length,
    }));
  }
}
