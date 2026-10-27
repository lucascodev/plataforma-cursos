import type { ReportReason } from '../../domain/types/report-reason.type';

const LABELS: Readonly<Record<ReportReason, string>> = {
  'false-info': 'Informação falsa',
  offensive: 'Conteúdo ofensivo',
  'suspicious-link': 'Link suspeito',
  other: 'Outro',
};

export function describeReportReason(reason: ReportReason): string {
  return LABELS[reason];
}
