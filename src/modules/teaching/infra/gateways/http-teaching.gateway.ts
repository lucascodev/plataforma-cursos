import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http/http-request.type';
import type { z } from 'zod';
import type { ResolveReviewItemInputDto } from '../../application/dtos/resolve-review-item-input.dto';
import type { SaveDraftInputDto } from '../../application/dtos/save-draft-input.dto';
import type { SetLabCodeInputDto } from '../../application/dtos/set-lab-code-input.dto';
import type { SubmitVersionInputDto } from '../../application/dtos/submit-version-input.dto';
import { VersionConflictError } from '../../application/errors/version-conflict.error';
import type { TeachingGateway } from '../../application/ports/teaching-gateway.interface';
import type { CourseStats } from '../../domain/entities/course-stats.entity';
import type { CourseWorkspace } from '../../domain/entities/course-workspace.entity';
import type { LabCodes } from '../../domain/entities/lab-codes.entity';
import type { TeacherCourse } from '../../domain/entities/teacher-course.entity';
import type { CourseVersion } from '../../domain/entities/versions/course-version.entity';
import type { OpenVersion } from '../../domain/entities/versions/open-version.entity';
import type { ReviewItem } from '../../domain/entities/versions/review-item.entity';
import { TEACHING_API_PATHS } from '../constants/teaching-api-paths';
import { InvalidTeachingResponseError } from '../errors/invalid-teaching-response.error';
import { teachingResponses } from '../schemas/teaching-responses.schema';

const isConflict = (error: unknown) => error instanceof HttpRequestError && error.status === 409 && error.problem?.code === 'version-conflict';

export class HttpTeachingGateway implements TeachingGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async listCourses(): Promise<TeacherCourse[]> {
    return (await this.send({ path: TEACHING_API_PATHS.courses }, teachingResponses.courses)).courses;
  }

  async getWorkspace(slug: string): Promise<CourseWorkspace | null> {
    try {
      return (await this.send({ path: TEACHING_API_PATHS.course(slug) }, teachingResponses.workspace)).workspace;
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 404) return null;
      throw error;
    }
  }

  async getStats(slug: string): Promise<CourseStats> {
    return (await this.send({ path: TEACHING_API_PATHS.stats(slug) }, teachingResponses.stats)).stats;
  }

  async openDraft(slug: string): Promise<OpenVersion> {
    return (await this.send({ method: 'POST', path: TEACHING_API_PATHS.draft(slug) }, teachingResponses.openedDraft)).version;
  }

  async saveDraft({ slug, versionId, revision, content }: SaveDraftInputDto): Promise<number> {
    const request: HttpRequest = { method: 'PUT', path: TEACHING_API_PATHS.draft(slug), body: { versionId, revision, content } };
    return (await this.sendWithConflict(request, teachingResponses.savedDraft)).revision;
  }

  async submitVersion({ slug, versionId, revision, kind, message }: SubmitVersionInputDto): Promise<CourseVersion> {
    const request: HttpRequest = { method: 'POST', path: TEACHING_API_PATHS.submit(slug), body: { versionId, revision, kind, message } };
    return (await this.sendWithConflict(request, teachingResponses.version)).version;
  }

  async withdrawVersion(slug: string, versionId: string): Promise<CourseVersion> {
    const request: HttpRequest = { method: 'POST', path: TEACHING_API_PATHS.withdraw(slug), body: { versionId } };
    return (await this.send(request, teachingResponses.version)).version;
  }

  async resolveReviewItem({ slug, versionId, itemId, resolved }: ResolveReviewItemInputDto): Promise<ReviewItem[]> {
    const request: HttpRequest = { method: 'PUT', path: TEACHING_API_PATHS.reviewItem(slug, itemId), body: { versionId, resolved } };
    return (await this.send(request, teachingResponses.reviewItems)).reviewItems;
  }

  async listLabCodes(slug: string): Promise<LabCodes> {
    return (await this.send({ path: TEACHING_API_PATHS.labCodes(slug) }, teachingResponses.labCodes)).codes;
  }

  async setLabCode({ slug, itemKey, code }: SetLabCodeInputDto): Promise<void> {
    await this.httpClient.request({ method: 'PUT', path: TEACHING_API_PATHS.labCode(slug, itemKey), body: { code } });
  }

  private async sendWithConflict<T>(request: HttpRequest, schema: z.ZodType<T>): Promise<T> {
    try {
      return await this.send(request, schema);
    } catch (error) {
      if (isConflict(error)) throw new VersionConflictError({ cause: error });
      throw error;
    }
  }

  private async send<T>(request: HttpRequest, schema: z.ZodType<T>): Promise<T> {
    const parsed = schema.safeParse(await this.httpClient.request(request));
    if (!parsed.success) throw new InvalidTeachingResponseError(request.path, { cause: parsed.error });
    return parsed.data;
  }
}
