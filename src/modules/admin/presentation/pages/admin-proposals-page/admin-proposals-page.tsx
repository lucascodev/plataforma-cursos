import { Link, useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import type { AdminProposalStatus } from '../../../domain/types/admin-proposal-status.type';
import { PersonChip } from '../../components/person-chip/person-chip';
import { describeProposalStatus, PROPOSAL_STATUS_LABELS } from '../../formatters/describe-proposal-status';
import { formatDateTime } from '../../formatters/format-date-time';
import { useAdminProposalsQuery } from '../../hooks/use-admin-proposals-query/use-admin-proposals-query';
import styles from '../../styles/admin-page.module.css';
import rowStyles from './admin-proposals-page.module.css';

const PAGE_SIZE = 50;
const STATUSES = Object.keys(PROPOSAL_STATUS_LABELS) as AdminProposalStatus[];
const STATUS_OPTIONS = [{ value: '', label: 'Todas' }, ...STATUSES.map((status) => ({ value: status, label: PROPOSAL_STATUS_LABELS[status] }))];
const readStatus = (value: string | null): AdminProposalStatus | null => (STATUSES as (string | null)[]).includes(value) ? (value as AdminProposalStatus) : null;

export function AdminProposalsPage() {
  const [params, setParams] = useSearchParams();
  const status = readStatus(params.get('status'));
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  const proposals = useAdminProposalsQuery(status, page);

  const update = (next: Record<string, string | null>) => {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    setParams(merged);
  };

  return (
    <>
      <title>Propostas</title>
      <h1 className={styles.title}>Propostas de curso</h1>
      <div className={styles.toolbar}>
        <SelectField label="Situação" options={STATUS_OPTIONS} value={status ?? ''} onChange={(event) => update({ status: event.target.value || null, pagina: null })} />
      </div>
      {proposals.isPending ? (
        <PageStatus title="Carregando propostas…" />
      ) : proposals.isError ? (
        <PageStatus title="Não foi possível carregar as propostas" />
      ) : proposals.data.items.length === 0 ? (
        <p className={styles.muted}>Nenhuma proposta nesta situação.</p>
      ) : (
        <>
          <ul className={styles.list}>
            {proposals.data.items.map((proposal) => (
              <li key={proposal.id} className={rowStyles.row}>
                <div className={rowStyles.top}>
                  <Link className={rowStyles.title} to={`/admin/propostas/${proposal.id}`}>
                    {proposal.title}
                  </Link>
                  <Badge tone={proposal.status === 'pending' ? 'accent' : 'neutral'}>{describeProposalStatus(proposal.status)}</Badge>
                </div>
                <p className={rowStyles.meta}>
                  <PersonChip person={proposal.author} /> · {proposal.area} · {formatDateTime(proposal.createdAt)}
                </p>
              </li>
            ))}
          </ul>
          <div className={styles.pager}>
            <span>{proposals.data.total === 1 ? '1 proposta' : `${proposals.data.total} propostas`}</span>
            {page > 1 ? <Button onClick={() => update({ pagina: String(page - 1) })}>Anteriores</Button> : null}
            {page * PAGE_SIZE < proposals.data.total ? <Button onClick={() => update({ pagina: String(page + 1) })}>Próximas</Button> : null}
          </div>
        </>
      )}
    </>
  );
}
