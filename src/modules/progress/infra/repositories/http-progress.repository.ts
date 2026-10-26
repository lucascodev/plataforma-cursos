import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import type { HttpClient } from '@/shared/application/ports/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http-request.type';
import type { CourseProgress } from '../../domain/entities/course-progress.entity';
import type { ProgressSummary } from '../../domain/entities/progress-summary.entity';
import { ProgressStorageError } from '../../domain/errors/progress-storage.error';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';
import { progressApiPath } from '../constants/progress-api-path';
import { PROGRESS_LIST_API_PATH } from '../constants/progress-list-api-path';
import { mapProgressRecordToEntity } from '../mappers/progress-record-to-entity.mapper';
import { progressResponseSchema } from '../schemas/progress-response.schema';
import { progressSummaryListResponseSchema } from '../schemas/progress-summary-list-response.schema';

// The server knows who is signed in from the session cookie, so no user id travels from here.
export class HttpProgressRepository implements ProgressRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async load(courseSlug: string): Promise<CourseProgress | null> {
    const body = await this.send('load', { path: progressApiPath(courseSlug) });
    const parsed = progressResponseSchema.safeParse(body);
    // Showing an empty course here would let the next save overwrite real data, so an unreadable answer is an error.
    if (!parsed.success) throw new ProgressStorageError('load', { cause: parsed.error });
    return parsed.data.progress ? mapProgressRecordToEntity(parsed.data.progress) : null;
  }

  async save(courseSlug: string, progress: CourseProgress): Promise<void> {
    await this.send('save', { method: 'PUT', path: progressApiPath(courseSlug), body: { progress } });
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
      throw new ProgressStorageError(operation, { cause: error });
    }
  }
}
