import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http/http-request.type';
import type { CourseProgress } from '../../domain/entities/course-progress.entity';
import type { ProgressSnapshot } from '../../domain/entities/progress-snapshot.entity';
import type { ProgressSummary } from '../../domain/entities/progress-summary.entity';
import { ProgressConflictError } from '../../domain/errors/progress-conflict.error';
import { ProgressStorageError } from '../../domain/errors/progress-storage.error';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';
import { progressApiPath } from '../constants/progress-api-path';
import { PROGRESS_CONFLICT_CODE } from '../constants/progress-conflict-code';
import { PROGRESS_LIST_API_PATH } from '../constants/progress-list-api-path';
import { mapProgressRecordToEntity } from '../mappers/progress-record-to-entity.mapper';
import { progressResponseSchema } from '../schemas/progress-response.schema';
import { progressSavedResponseSchema } from '../schemas/progress-saved-response.schema';
import { progressSummaryListResponseSchema } from '../schemas/progress-summary-list-response.schema';

// The server knows who is signed in from the session cookie, so no user id travels from here.
export class HttpProgressRepository implements ProgressRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async load(courseSlug: string): Promise<ProgressSnapshot | null> {
    const body = await this.send('load', { path: progressApiPath(courseSlug) });
    const parsed = progressResponseSchema.safeParse(body);
    // Showing an empty course here would let the next save overwrite real data, so an unreadable answer is an error.
    if (!parsed.success) throw new ProgressStorageError('load', { cause: parsed.error });
    return parsed.data.progress ? { progress: mapProgressRecordToEntity(parsed.data.progress), revision: parsed.data.revision } : null;
  }

  async save(courseSlug: string, progress: CourseProgress, baseRevision: number): Promise<number> {
    const body = await this.send('save', { method: 'PUT', path: progressApiPath(courseSlug), body: { progress, baseRevision } });
    const parsed = progressSavedResponseSchema.safeParse(body);
    if (!parsed.success) throw new ProgressStorageError('save', { cause: parsed.error });
    return parsed.data.revision;
  }

  async clear(courseSlug: string): Promise<void> {
    await this.send('clear', { method: 'DELETE', path: progressApiPath(courseSlug) });
  }

  async listSummaries(): Promise<ProgressSummary[]> {
    const parsed = progressSummaryListResponseSchema.safeParse(await this.send('load', { path: PROGRESS_LIST_API_PATH }));
    if (!parsed.success) throw new ProgressStorageError('load', { cause: parsed.error });
    return parsed.data.items.map((item) => ({
      courseSlug: item.courseSlug,
      updatedAt: item.updatedAt,
      completedItemIds: Object.keys(item.completedItems),
      studyDayCount: Object.keys(item.studyDays).length,
    }));
  }

  private async send(operation: ProgressStorageError['operation'], request: HttpRequest): Promise<unknown> {
    try {
      return await this.httpClient.request(request);
    } catch (error) {
      if (error instanceof SessionExpiredError) throw error;
      if (error instanceof HttpRequestError && error.problem?.code === PROGRESS_CONFLICT_CODE) throw new ProgressConflictError({ cause: error });
      throw new ProgressStorageError(operation, { cause: error });
    }
  }
}
