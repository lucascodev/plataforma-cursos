import type { AdminCourse } from '../../domain/entities/admin-course.entity';
import type { AdminOverview } from '../../domain/entities/admin-overview.entity';
import type { AdminPerson } from '../../domain/entities/people/admin-person.entity';
import type { AdminProposal } from '../../domain/entities/admin-proposal.entity';
import type { AuditPage } from '../../domain/entities/audit/audit-page.entity';
import type { AdminCourseVersion } from '../../domain/entities/versions/admin-course-version.entity';
import type { AdminVersionDetail } from '../../domain/entities/versions/admin-version-detail.entity';
import type { PagedList } from '../../domain/entities/paged-list.entity';
import type { AdminRole } from '../../domain/types/admin-role.type';
import type { ApproveProposalInputDto } from '../dtos/approve-proposal-input.dto';
import type { DecideProposalInputDto } from '../dtos/decide-proposal-input.dto';
import type { ListPeopleInputDto } from '../dtos/list-people-input.dto';
import type { ListProposalsInputDto } from '../dtos/list-proposals-input.dto';
import type { PublishVersionInputDto } from '../dtos/publish-version-input.dto';

export interface AdminGateway {
  getOverview(): Promise<AdminOverview>;
  listProposals(input: ListProposalsInputDto): Promise<PagedList<AdminProposal>>;
  getProposal(id: string): Promise<AdminProposal | null>;
  approveProposal(input: ApproveProposalInputDto): Promise<{ courseSlug: string }>;
  decideProposal(input: DecideProposalInputDto): Promise<void>;
  listCourses(): Promise<AdminCourse[]>;
  setCourseListed(slug: string, listed: boolean): Promise<void>;
  setCourseOwner(slug: string, handle: string): Promise<void>;
  deleteCourse(slug: string): Promise<void>;
  listPeople(input: ListPeopleInputDto): Promise<PagedList<AdminPerson>>;
  setRole(personId: string, role: AdminRole): Promise<void>;
  listAudit(before: number | null): Promise<AuditPage>;
  listVersions(slug: string): Promise<AdminCourseVersion[]>;
  getVersion(id: string): Promise<AdminVersionDetail | null>;
  publishVersion(input: PublishVersionInputDto): Promise<void>;
  requestVersionChanges(id: string, revision: number, items: readonly string[]): Promise<void>;
  restoreVersion(id: string): Promise<void>;
}
