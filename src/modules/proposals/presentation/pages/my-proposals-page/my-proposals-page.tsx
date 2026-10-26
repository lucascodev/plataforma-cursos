import { Link, useLocation } from 'react-router';
import { RequireRole } from '@/modules/auth';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { ProposalCard } from '../../components/proposal-card/proposal-card';
import { useMyProposalsQuery } from '../../hooks/use-my-proposals-query/use-my-proposals-query';
import styles from './my-proposals-page.module.css';

const ALL_ROLES = ['student', 'teacher', 'admin'] as const;

function MyProposals() {
  const proposals = useMyProposalsQuery();
  if (proposals.isPending) return <PageStatus title="Carregando suas propostas…" />;
  if (proposals.isError) return <PageStatus title="Não foi possível carregar suas propostas" />;

  return (
    <div className={styles.page}>
      <title>Minhas propostas</title>
      <header className={styles.header}>
        <h1 className={styles.title}>Minhas propostas</h1>
        <Link className={styles.new} to="/propor-curso">
          Nova proposta
        </Link>
      </header>
      {proposals.data.length === 0 ? (
        <p className={styles.empty}>
          Você ainda não propôs nenhum curso. <Link to="/propor-curso">Que tal começar?</Link>
        </p>
      ) : (
        <ul className={styles.list}>
          {proposals.data.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function MyProposalsPage() {
  const location = useLocation();
  return (
    <RequireRole roles={ALL_ROLES} returnPath={location.pathname}>
      <MyProposals />
    </RequireRole>
  );
}
