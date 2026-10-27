import { useSearchParams } from 'react-router';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import type { ReportStatus } from '../../../domain/types/report-status.type';
import { FilterChips } from '../../components/filter-chips/filter-chips';
import { ReportRow } from '../../components/report-row/report-row';
import { useReportsQuery } from '../../hooks/use-reports-query/use-reports-query';
import styles from '../../styles/admin-page.module.css';

const STATUSES: readonly { readonly value: ReportStatus; readonly label: string }[] = [
  { value: 'open', label: 'Abertos' },
  { value: 'resolved', label: 'Resolvidos' },
  { value: 'dismissed', label: 'Arquivados' },
];
const readStatus = (value: string | null): ReportStatus => STATUSES.find((status) => status.value === value)?.value ?? 'open';

export function AdminReportsPage() {
  const [params, setParams] = useSearchParams();
  const status = readStatus(params.get('situacao'));
  const reports = useReportsQuery(status);

  return (
    <>
      <title>Avisos</title>
      <h1 className={styles.title}>Avisos sobre perfis</h1>
      <p className={styles.lead}>
        Quem estuda avisa a equipe quando algo num perfil público parece errado. Para agir, edite o papel ou a conta da pessoa em Pessoas e papéis,
        ou tire o curso do catálogo em Cursos.
      </p>
      <FilterChips
        label="Situação dos avisos"
        options={STATUSES}
        selected={status}
        onSelect={(value) => setParams(value && value !== 'open' ? new URLSearchParams({ situacao: value }) : new URLSearchParams())}
      />
      {reports.isPending ? (
        <PageStatus title="Carregando avisos…" />
      ) : reports.isError ? (
        <PageStatus title="Não foi possível carregar os avisos" />
      ) : reports.data.length === 0 ? (
        <p className={styles.muted}>Nenhum aviso aqui.</p>
      ) : (
        <ul className={styles.list}>
          {reports.data.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </ul>
      )}
    </>
  );
}
