import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { z } from 'zod';
import type { ApproveProposalInputDto } from '../../application/dtos/approve-proposal-input.dto';
import type { DecideProposalInputDto } from '../../application/dtos/decide-proposal-input.dto';
import type { ListCoursesInputDto } from '../../application/dtos/list-courses-input.dto';
import type { SetCourseListedInputDto } from '../../application/dtos/set-course-listed-input.dto';
import type { ListPeopleInputDto } from '../../application/dtos/list-people-input.dto';
import type { ListProposalsInputDto } from '../../application/dtos/list-proposals-input.dto';
import type { PublishVersionInputDto } from '../../application/dtos/publish-version-input.dto';
import type { AdminGateway } from '../../application/ports/admin-gateway.interface';
import type { AdminCourse } from '../../domain/entities/admin-course.entity';
import type { AdminOverview } from '../../domain/entities/admin-overview.entity';
import type { AdminPerson } from '../../domain/entities/people/admin-person.entity';
import type { AdminProposal } from '../../domain/entities/admin-proposal.entity';
import type { AuditPage } from '../../domain/entities/audit/audit-page.entity';
import type { PagedList } from '../../domain/entities/paged-list.entity';
import type { AdminCourseVersion } from '../../domain/entities/versions/admin-course-version.entity';
import type { AdminVersionDetail } from '../../domain/entities/versions/admin-version-detail.entity';
import type { AttentionItem } from '../../domain/entities/attention-item.entity';
import type { NavBadges } from '../../domain/entities/nav-badges.entity';
import type { AdminReport } from '../../domain/entities/reports/admin-report.entity';
import type { VersionImpact } from '../../domain/entities/versions/version-impact.entity';
import type { AdminRole } from '../../domain/types/admin-role.type';
import type { AuditKind } from '../../domain/types/audit-kind.type';
import type { ReportStatus } from '../../domain/types/report-status.type';
import { ADMIN_API_PATHS } from '../constants/admin-api-paths';
import { InvalidAdminResponseError } from '../errors/invalid-admin-response.error';
import { adminResponses } from '../schemas/admin-responses.schema';

type ProposalRecord = z.infer<typeof adminResponses.proposal>['proposal'];

const toProposal = (record: ProposalRecord): AdminProposal => ({ ...record, author: record.author ?? null });

const withQuery = (path: string, params: Record<string, string | null>) => {
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString();
  return query ? `${path}?${query}` : path;
};

export class HttpAdminGateway implements AdminGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getOverview(): Promise<AdminOverview> {
    return (await this.get(ADMIN_API_PATHS.overview, adminResponses.overview)).overview;
  }

  async listProposals({ status, page }: ListProposalsInputDto): Promise<PagedList<AdminProposal>> {
    const result = await this.get(withQuery(ADMIN_API_PATHS.proposals, { status, page: page > 1 ? String(page) : null }), adminResponses.proposals);
    return { items: result.items.map(toProposal), total: result.total };
  }

  async getProposal(id: string): Promise<AdminProposal | null> {
    try {
      return toProposal((await this.get(ADMIN_API_PATHS.proposal(id), adminResponses.proposal)).proposal);
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 404) return null;
      throw error;
    }
  }

  async approveProposal({ id, slug, note }: ApproveProposalInputDto): Promise<{ courseSlug: string }> {
    const path = ADMIN_API_PATHS.approve(id);
    return this.parse(path, adminResponses.approval, await this.httpClient.request({ method: 'POST', path, body: { slug, note } }));
  }

  async decideProposal({ id, decision, note }: DecideProposalInputDto): Promise<void> {
    const path = decision === 'refused' ? ADMIN_API_PATHS.refuse(id) : ADMIN_API_PATHS.requestChanges(id);
    await this.httpClient.request({ method: 'POST', path, body: { note } });
  }

  async listCourses({ query, status }: ListCoursesInputDto): Promise<AdminCourse[]> {
    return (await this.get(withQuery(ADMIN_API_PATHS.courses, { q: query || null, status }), adminResponses.courses)).courses;
  }

  async setCourseListed({ slug, listed, reason, note }: SetCourseListedInputDto): Promise<void> {
    await this.httpClient.request({ method: 'PUT', path: ADMIN_API_PATHS.courseListing(slug), body: { listed, reason, note } });
  }

  async isSlugAvailable(slug: string): Promise<boolean> {
    return (await this.get(ADMIN_API_PATHS.slug(slug), adminResponses.slug)).available;
  }

  async setCourseOwner(slug: string, handle: string): Promise<void> {
    await this.httpClient.request({ method: 'PUT', path: ADMIN_API_PATHS.courseOwner(slug), body: { handle } });
  }

  async deleteCourse(slug: string): Promise<void> {
    await this.httpClient.request({ method: 'DELETE', path: ADMIN_API_PATHS.course(slug) });
  }

  async listPeople({ query, role, page }: ListPeopleInputDto): Promise<PagedList<AdminPerson>> {
    const path = withQuery(ADMIN_API_PATHS.people, { q: query.trim() || null, role, page: page > 1 ? String(page) : null });
    return this.get(path, adminResponses.people);
  }

  async setRole(personId: string, role: AdminRole): Promise<void> {
    await this.httpClient.request({ method: 'PUT', path: ADMIN_API_PATHS.personRole(personId), body: { role } });
  }

  async listAudit(before: number | null, kind: AuditKind | null): Promise<AuditPage> {
    return this.get(withQuery(ADMIN_API_PATHS.audit, { before: before === null ? null : String(before), kind }), adminResponses.audit);
  }

  async getNavBadges(): Promise<NavBadges> {
    return (await this.get(ADMIN_API_PATHS.badges, adminResponses.badges)).badges;
  }

  async getAttentionQueue(): Promise<AttentionItem[]> {
    return (await this.get(ADMIN_API_PATHS.attention, adminResponses.attention)).items;
  }

  async getVersionImpact(id: string): Promise<VersionImpact> {
    return (await this.get(ADMIN_API_PATHS.versionImpact(id), adminResponses.impact)).impact;
  }

  async listReports(status: ReportStatus): Promise<AdminReport[]> {
    return (await this.get(withQuery(ADMIN_API_PATHS.reports, { status }), adminResponses.reports)).reports;
  }

  async resolveReport(id: string, decision: 'resolved' | 'dismissed'): Promise<void> {
    const path = decision === 'resolved' ? ADMIN_API_PATHS.resolveReport(id) : ADMIN_API_PATHS.dismissReport(id);
    await this.httpClient.request({ method: 'POST', path });
  }

  async endSessions(personId: string): Promise<void> {
    await this.httpClient.request({ method: 'DELETE', path: ADMIN_API_PATHS.personSessions(personId) });
  }

  async setBlocked(personId: string, blocked: boolean): Promise<void> {
    await this.httpClient.request({ method: 'PUT', path: ADMIN_API_PATHS.personBlock(personId), body: { blocked } });
  }

  async deletePerson(personId: string): Promise<void> {
    await this.httpClient.request({ method: 'DELETE', path: ADMIN_API_PATHS.person(personId) });
  }

  async listVersions(slug: string): Promise<AdminCourseVersion[]> {
    return (await this.get(ADMIN_API_PATHS.courseVersions(slug), adminResponses.versions)).versions;
  }

  async getVersion(id: string): Promise<AdminVersionDetail | null> {
    try {
      return await this.get(ADMIN_API_PATHS.version(id), adminResponses.version);
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 404) return null;
      throw error;
    }
  }

  async publishVersion({ id, revision, releaseNote }: PublishVersionInputDto): Promise<void> {
    await this.httpClient.request({ method: 'POST', path: ADMIN_API_PATHS.publishVersion(id), body: { revision, releaseNote } });
  }

  async requestVersionChanges(id: string, revision: number, items: readonly string[]): Promise<void> {
    await this.httpClient.request({ method: 'POST', path: ADMIN_API_PATHS.requestVersionChanges(id), body: { revision, items } });
  }

  async restoreVersion(id: string): Promise<void> {
    await this.httpClient.request({ method: 'POST', path: ADMIN_API_PATHS.restoreVersion(id) });
  }

  private async get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    return this.parse(path, schema, await this.httpClient.request({ path }));
  }

  private parse<T>(path: string, schema: z.ZodType<T>, body: unknown): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new InvalidAdminResponseError(path, { cause: parsed.error });
    return parsed.data;
  }
}
