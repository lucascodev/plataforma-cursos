import { Link, useNavigate } from 'react-router';
import { useAuthSession } from '@/modules/auth';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { countOpenProposals, MAX_OPEN_PROPOSALS } from '../../../domain/rules/count-open-proposals.rule';
import { ProposalFlow } from '../../components/proposal-flow/proposal-flow';
import { ProposalForm } from '../../components/proposal-form/proposal-form';
import { useMyProposalsQuery } from '../../hooks/use-my-proposals-query/use-my-proposals-query';
import { useSubmitProposalMutation } from '../../hooks/use-submit-proposal-mutation/use-submit-proposal-mutation';
import styles from './propose-course-page.module.css';

export function ProposeCoursePage() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const mine = useMyProposalsQuery();
  const submit = useSubmitProposalMutation();
  const openCount = mine.data ? countOpenProposals(mine.data) : 0;

  return (
    <div className={styles.page}>
      <title>Propor um curso</title>
      <header className={styles.header}>
        <h1 className={styles.title}>Propor um curso</h1>
        <p className={styles.lead}>
          Qualquer pessoa pode ensinar aqui. Conte a ideia do curso; se for aprovada, você monta tudo pela plataforma, com plano diário,
          exercícios e projetos.
        </p>
      </header>
      <ProposalFlow />

      {session.status === 'loading' ? null : !session.user ? (
        <Notice>
          <p>Entre com o GitHub para enviar a proposta. Ela fica guardada na sua conta e você acompanha a análise por aqui.</p>
          <Button tone="primary" onClick={() => session.signIn('/propor-curso')}>
            Entrar com o GitHub
          </Button>
        </Notice>
      ) : openCount >= MAX_OPEN_PROPOSALS ? (
        <Notice tone="warning">
          Você já tem {MAX_OPEN_PROPOSALS} propostas abertas. Espere a análise de uma delas ou <Link to="/minhas-propostas">retire alguma</Link>.
        </Notice>
      ) : (
        <ProposalForm
          initial={null}
          submitLabel="Enviar proposta"
          isSubmitting={submit.isPending}
          serverError={submit.isError ? readErrorMessage(submit.error, 'Não foi possível enviar a proposta agora.') : null}
          onSubmit={(draft) =>
            submit.mutate(draft, {
              onSuccess: (proposal) => void navigate(`/minhas-propostas/${proposal.id}`),
            })
          }
        />
      )}
    </div>
  );
}
