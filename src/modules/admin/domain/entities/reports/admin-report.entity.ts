import type { ReportReason } from '../../types/report-reason.type';
import type { ReportStatus } from '../../types/report-status.type';
import type { PersonCard } from '../people/person-card.entity';

export interface AdminReport {
  readonly id: string;
  readonly status: ReportStatus;
  readonly reason: ReportReason;
  readonly details: string;
  readonly createdAt: string;
  readonly resolvedAt: string | null;
  readonly profile: PersonCard | null;
  readonly reporter: PersonCard | null;
}
