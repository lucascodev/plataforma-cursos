import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http-client.interface';
import type { z } from 'zod';
import type { ApproveProposalInputDto } from '../../application/dtos/approve-proposal-input.dto';
import type { DecideProposalInputDto } from '../../application/dtos/decide-proposal-input.dto';
import type { ListPeopleInputDto } from '../../application/dtos/list-people-input.dto';
import type { ListProposalsInputDto } from '../../application/dtos/list-proposals-input.dto';
import type { AdminGateway } from '../../application/ports/admin-gateway.interface';
import type { AdminCourse } from '../../domain/entities/admin-course.entity';
import type { AdminOverview } from '../../domain/entities/admin-overview.entity';
import type { AdminPerson } from '../../domain/entities/admin-person.entity';
import type { AdminProposal } from '../../domain/entities/admin-proposal.entity';
import type { AuditPage } from '../../domain/entities/audit-page.entity';
import type { PagedList } from '../../domain/entities/paged-list.entity';
import type { AdminRole } from '../../domain/types/admin-role.type';
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

  async listCourses(): Promise<AdminCourse[]> {
    return (await this.get(ADMIN_API_PATHS.courses, adminResponses.courses)).courses;
  }

  async setCourseListed(slug: string, listed: boolean): Promise<void> {
    await this.httpClient.request({ method: 'PUT', path: ADMIN_API_PATHS.courseListing(slug), body: { listed } });
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

  async listAudit(before: number | null): Promise<AuditPage> {
    return this.get(withQuery(ADMIN_API_PATHS.audit, { before: before === null ? null : String(before) }), adminResponses.audit);
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
