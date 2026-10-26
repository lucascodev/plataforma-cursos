import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { AdminProposal } from '../../../domain/entities/admin-proposal.entity';
import { useProposalReview } from '../../hooks/use-proposal-review/use-proposal-review';
import styles from './proposal-review-panel.module.css';

export function ProposalReviewPanel({ proposal }: { proposal: AdminProposal }) {
  const review = useProposalReview(proposal);

  if (review.approvedSlug) {
    return (
      <Notice tone="success">
        <p>
          Proposta aprovada. {proposal.author?.displayName ?? 'A pessoa'} agora é professor e o rascunho /cursos/{review.approvedSlug} foi criado.
        </p>
        <p>
          <Link to="/admin/propostas">Voltar para a fila</Link>
        </p>
      </Notice>
    );
  }
  if (review.decided) {
    return (
      <Notice tone="success">
        <p>Resposta enviada para quem propôs.</p>
        <p>
          <Link to="/admin/propostas">Voltar para a fila</Link>
        </p>
      </Notice>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="revisao-titulo">
      <h2 id="revisao-titulo" className={styles.title}>
        Sua decisão
      </h2>
      <TextField
        label="Endereço do curso"
        hint="Vira /cursos/endereco. Não muda depois da aprovação."
        value={review.slug}
        maxLength={60}
        error={review.slugError}
        onChange={(event) => review.setSlug(event.target.value)}
      />
      <TextAreaField
        label="Recado para quem propôs"
        hint="Obrigatório para pedir ajustes ou recusar. Opcional na aprovação."
        value={review.note}
        maxLength={2000}
        onChange={(event) => review.setNote(event.target.value)}
      />
      {review.error ? <Notice tone="warning">{review.error}</Notice> : null}
      <div className={styles.actions}>
        <Button tone="primary" disabled={review.isWorking || review.slugError !== null} onClick={review.approve}>
          Aprovar e criar rascunho
        </Button>
        <Button disabled={review.isWorking} onClick={review.requestChanges}>
          Pedir ajustes
        </Button>
        <Button tone="danger" disabled={review.isWorking} onClick={review.refuse}>
          Recusar
        </Button>
      </div>
    </section>
  );
}
