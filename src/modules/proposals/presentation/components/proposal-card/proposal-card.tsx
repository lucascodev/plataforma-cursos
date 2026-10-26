import { Link } from 'react-router';
import { formatDayMonth } from '@/shared/utils/date/format/format-day-month';
import type { Proposal } from '../../../domain/entities/proposal.entity';
import { ProposalStatusBadge } from '../proposal-status-badge/proposal-status-badge';
import styles from './proposal-card.module.css';

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <li className={styles.card}>
      <div className={styles.top}>
        <Link className={styles.title} to={`/minhas-propostas/${proposal.id}`}>
          {proposal.title}
        </Link>
        <ProposalStatusBadge status={proposal.status} />
      </div>
      <p className={styles.meta}>
        {proposal.area} · {proposal.outline.length === 1 ? '1 módulo' : `${proposal.outline.length} módulos`} · enviada em {formatDayMonth(proposal.createdAt.slice(0, 10))}
      </p>
      {proposal.status === 'changes_requested' && proposal.reviewNote ? <p className={styles.note}>{proposal.reviewNote}</p> : null}
    </li>
  );
}
