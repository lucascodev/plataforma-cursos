import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { RequireRole } from '@/modules/auth';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { Proposal } from '../../../domain/entities/proposal.entity';
import { canEditProposal } from '../../../domain/rules/can-edit-proposal.rule';
import { ProposalForm } from '../../components/proposal-form/proposal-form';
import { ProposalStatusBadge } from '../../components/proposal-status-badge/proposal-status-badge';
import { useProposalQuery } from '../../hooks/use-proposal-query/use-proposal-query';
import { useUpdateProposalMutation } from '../../hooks/use-update-proposal-mutation/use-update-proposal-mutation';
import { useWithdrawProposalMutation } from '../../hooks/use-withdraw-proposal-mutation/use-withdraw-proposal-mutation';
import styles from './proposal-detail-page.module.css';

const ALL_ROLES = ['student', 'teacher', 'admin'] as const;

function ReviewOutcome({ proposal }: { proposal: Proposal }) {
  if (proposal.status === 'approved') {
    return (
      <Notice tone="success">
        <p>Proposta aprovada. Você agora é professor e o curso foi criado como rascunho no endereço /cursos/{proposal.courseSlug}.</p>
        <p>Escreva o curso no editor. Só você e a equipe veem o rascunho até a primeira versão ser publicada.</p>
        {proposal.courseSlug ? (
          <p>
            <Link to={`/professor/cursos/${proposal.courseSlug}/editar`}>Abrir o editor do curso</Link> ·{' '}
            <Link to="/perfil">Completar perfil de professor</Link>
          </p>
        ) : null}
        {proposal.reviewNote ? <p>Recado da equipe: {proposal.reviewNote}</p> : null}
      </Notice>
    );
  }
  if (proposal.status === 'changes_requested') {
    return (
      <Notice tone="warning">
        <p>A equipe pediu ajustes: {proposal.reviewNote}</p>
        <p>Edite abaixo e salve. A proposta volta para a fila de análise.</p>
      </Notice>
    );
  }
  if (proposal.status === 'refused') return <Notice>Proposta recusada. Motivo: {proposal.reviewNote}</Notice>;
  if (proposal.status === 'withdrawn') return <Notice>Você retirou esta proposta.</Notice>;
  return <Notice>Em análise. Você recebe a resposta aqui mesmo.</Notice>;
}

function ProposalDetail({ id }: { id: string }) {
  const proposal = useProposalQuery(id);
  const update = useUpdateProposalMutation(id);
  const withdraw = useWithdrawProposalMutation(id);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

  if (proposal.isPending) return <PageStatus title="Carregando proposta…" />;
  if (proposal.isError) return <PageStatus title="Não foi possível carregar a proposta" />;
  if (!proposal.data) {
    return (
      <PageStatus title="Proposta não encontrada">
        <p>
          <Link to="/minhas-propostas">Ver minhas propostas</Link>
        </p>
      </PageStatus>
    );
  }
  const current = proposal.data;
  const editable = canEditProposal(current.status);

  return (
    <div className={styles.page}>
      <title>{current.title}</title>
      <p className={styles.back}>
        <Link to="/minhas-propostas">Minhas propostas</Link>
      </p>
      <header className={styles.header}>
        <h1 className={styles.title}>{current.title}</h1>
        <ProposalStatusBadge status={current.status} />
      </header>
      <ReviewOutcome proposal={current} />

      {editable ? (
        <>
          <ProposalForm
            key={current.updatedAt}
            initial={current}
            submitLabel={current.status === 'changes_requested' ? 'Salvar e reenviar' : 'Salvar alterações'}
            isSubmitting={update.isPending}
            serverError={update.isError ? readErrorMessage(update.error, 'Não foi possível salvar agora.') : null}
            onSubmit={(draft) => update.mutate(draft)}
          />
          {update.isSuccess ? <Notice tone="success">Proposta salva.</Notice> : null}
          <section className={styles.withdraw} aria-label="Retirar proposta">
            {confirmingWithdraw ? (
              <>
                <span>Retirar a proposta? Ela sai da fila e não pode ser reaberta.</span>
                <Button tone="danger" disabled={withdraw.isPending} onClick={() => withdraw.mutate()}>
                  Sim, retirar
                </Button>
                <Button onClick={() => setConfirmingWithdraw(false)}>Cancelar</Button>
              </>
            ) : (
              <Button tone="danger" onClick={() => setConfirmingWithdraw(true)}>
                Retirar proposta
              </Button>
            )}
            {withdraw.isError ? <Notice tone="warning">{readErrorMessage(withdraw.error, 'Não foi possível retirar agora.')}</Notice> : null}
          </section>
        </>
      ) : (
        <dl className={styles.summary}>
          <dt>Do que trata</dt>
          <dd>{current.summary}</dd>
          <dt>Para quem é</dt>
          <dd>{current.audience}</dd>
          <dt>Módulos</dt>
          <dd>
            <ol className={styles.outline}>
              {current.outline.map((title, index) => (
                <li key={index}>{title}</li>
              ))}
            </ol>
          </dd>
        </dl>
      )}
    </div>
  );
}

export function ProposalDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  return (
    <RequireRole roles={ALL_ROLES} returnPath={location.pathname}>
      <ProposalDetail id={id} />
    </RequireRole>
  );
}
