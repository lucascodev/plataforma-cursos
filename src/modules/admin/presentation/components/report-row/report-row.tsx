import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { AdminReport } from '../../../domain/entities/reports/admin-report.entity';
import { describeReportReason } from '../../formatters/describe-report-reason';
import { formatDateTime } from '../../formatters/format-date-time';
import { useResolveReportMutation } from '../../hooks/use-resolve-report-mutation/use-resolve-report-mutation';
import { PersonChip } from '../person-chip/person-chip';
import styles from '../course-row/course-row.module.css';

export function ReportRow({ report }: { readonly report: AdminReport }) {
  const resolve = useResolveReportMutation();
  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <div className={styles.identity}>
          {report.profile ? (
            <Link className={styles.title} to={`/professores/${report.profile.handle}`}>
              {report.profile.displayName}
            </Link>
          ) : (
            <span className={styles.title}>Perfil excluído</span>
          )}
          <span className={styles.slug}>{formatDateTime(report.createdAt)}</span>
        </div>
        <Badge tone="warning">{describeReportReason(report.reason)}</Badge>
      </div>
      {report.details ? <p className={styles.meta}>{report.details}</p> : null}
      <p className={styles.meta}>
        Avisado por <PersonChip person={report.reporter} />. A pessoa avisada não vê quem avisou.
      </p>
      {report.status === 'open' ? (
        <div className={styles.actions}>
          <Button disabled={resolve.isPending} onClick={() => resolve.mutate({ id: report.id, decision: 'resolved' })}>
            Marcar como resolvido
          </Button>
          <Button disabled={resolve.isPending} onClick={() => resolve.mutate({ id: report.id, decision: 'dismissed' })}>
            Arquivar sem ação
          </Button>
        </div>
      ) : null}
      {resolve.isError ? <Notice tone="warning">{readErrorMessage(resolve.error, 'Não foi possível concluir agora.')}</Notice> : null}
    </li>
  );
}
