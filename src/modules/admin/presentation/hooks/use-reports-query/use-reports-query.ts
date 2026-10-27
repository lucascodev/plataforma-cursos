import { useQuery } from '@tanstack/react-query';
import type { ReportStatus } from '../../../domain/types/report-status.type';
import { makeListReports } from '../../../main/factories/reports/make-list-reports.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useReportsQuery(status: ReportStatus) {
  return useQuery({ queryKey: adminQueryKeys.reports(status), queryFn: () => makeListReports().execute(status), staleTime: 15_000 });
}
