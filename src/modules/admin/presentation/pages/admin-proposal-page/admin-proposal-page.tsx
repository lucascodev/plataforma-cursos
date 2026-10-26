import { Link, useParams } from 'react-router';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { PersonChip } from '../../components/person-chip/person-chip';
import { ProposalReviewPanel } from '../../components/proposal-review-panel/proposal-review-panel';
import { describeProposalStatus } from '../../formatters/describe-proposal-status';
import { formatDateTime } from '../../formatters/format-date-time';
import { useAdminProposalQuery } from '../../hooks/use-admin-proposal-query/use-admin-proposal-query';
import styles from '../../styles/admin-page.module.css';
import detailStyles from './admin-proposal-page.module.css';

export function AdminProposalPage() {
  const { id = '' } = useParams();
  const proposal = useAdminProposalQuery(id);

  if (proposal.isPending) return <PageStatus title="Carregando proposta…" />;
  if (proposal.isError) return <PageStatus title="Não foi possível carregar a proposta" />;
  if (!proposal.data) return <PageStatus title="Proposta não encontrada" />;
  const current = proposal.data;

  return (
    <>
      <title>{current.title}</title>
      <p className={detailStyles.back}>
        <Link to="/admin/propostas">Propostas</Link>
      </p>
      <header className={detailStyles.header}>
        <h1 className={styles.title}>{current.title}</h1>
        <Badge tone={current.status === 'pending' ? 'accent' : 'neutral'}>{describeProposalStatus(current.status)}</Badge>
      </header>
      <p className={detailStyles.meta}>
        <PersonChip person={current.author} /> · enviada em {formatDateTime(current.createdAt)} · {current.area} · {current.language}
      </p>
      <dl className={detailStyles.details}>
        <dt>Do que trata</dt>
        <dd>{current.summary}</dd>
        <dt>Para quem é</dt>
        <dd>{current.audience}</dd>
        <dt>Módulos previstos</dt>
        <dd>
          <ol>
            {current.outline.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ol>
        </dd>
        {current.experience ? (
          <>
            <dt>Experiência com o tema</dt>
            <dd>{current.experience}</dd>
          </>
        ) : null}
        {current.sampleUrl ? (
          <>
            <dt>Amostra</dt>
            <dd>
              <ExternalLink href={current.sampleUrl}>{current.sampleUrl}</ExternalLink>
            </dd>
          </>
        ) : null}
      </dl>
      {current.status === 'pending' ? (
        <ProposalReviewPanel proposal={current} />
      ) : current.reviewNote ? (
        <Notice>Recado enviado: {current.reviewNote}</Notice>
      ) : null}
    </>
  );
}
