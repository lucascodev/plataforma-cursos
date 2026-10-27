import type { ProfileReportReason } from '../../domain/types/profile-report-reason.type';

export interface ReportTeacherInputDto {
  readonly handle: string;
  readonly reason: ProfileReportReason;
  readonly details: string;
}
