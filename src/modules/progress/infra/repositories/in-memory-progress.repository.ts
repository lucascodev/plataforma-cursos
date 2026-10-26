import type { CourseProgress } from '../../domain/entities/course-progress.entity';
import type { ProgressSummary } from '../../domain/entities/progress-summary.entity';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';

export class InMemoryProgressRepository implements ProgressRepository {
  private readonly records = new Map<string, CourseProgress>();

  async load(courseSlug: string): Promise<CourseProgress | null> {
    return this.records.get(courseSlug) ?? null;
  }

  async save(courseSlug: string, progress: CourseProgress): Promise<void> {
    this.records.set(courseSlug, progress);
  }

  async clear(courseSlug: string): Promise<void> {
    this.records.delete(courseSlug);
  }

  async listSummaries(): Promise<ProgressSummary[]> {
    return [...this.records].map(([courseSlug, progress]) => ({
      courseSlug,
      updatedAt: progress.updatedAt ?? '',
      completedItemIds: Object.keys(progress.completedItems),
      studyDayCount: Object.keys(progress.studyDays).length,
    }));
  }
}
