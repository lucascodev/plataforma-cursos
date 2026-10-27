import { nextSemver } from '@contracts/version/next-semver';
import { useState } from 'react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { RadioCard } from '@/shared/presentation/components/form/radio-card/radio-card';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import type { SubmittableVersionKind } from '../../../domain/types/version-kind.type';
import styles from '../../styles/editor.module.css';

const KINDS: readonly { readonly kind: SubmittableVersionKind; readonly title: string; readonly description: string }[] = [
  { kind: 'patch', title: 'Correção', description: 'Texto revisado, links consertados, detalhes.' },
  { kind: 'minor', title: 'Novidade', description: 'Aulas, exercícios ou módulos novos.' },
  { kind: 'major', title: 'Mudança grande', description: 'O curso muda de estrutura ou de rumo.' },
];

interface SubmitVersionDialogProps {
  readonly open: boolean;
  readonly publishedSemver: string | null;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly onSubmit: (kind: SubmittableVersionKind, message: string) => void;
  readonly onClose: () => void;
}

export function SubmitVersionDialog({ open, publishedSemver, isSubmitting, error, onSubmit, onClose }: SubmitVersionDialogProps) {
  const [kind, setKind] = useState<SubmittableVersionKind>('minor');
  const [message, setMessage] = useState('');
  const semver = nextSemver(publishedSemver, publishedSemver === null ? 'first' : kind);

  return (
    <Dialog
      open={open}
      title={`Enviar a versão ${semver} para revisão?`}
      description={
        publishedSemver
          ? `A equipe revisa e publica. Enquanto isso, a versão ${publishedSemver} continua no ar e este rascunho fica travado para edição.`
          : 'A equipe revisa e publica. Enquanto isso, o rascunho fica travado para edição.'
      }
      onClose={onClose}
      actions={
        <>
          <Button size="md" onClick={onClose}>
            Continuar editando
          </Button>
          <Button size="md" tone="primary" isLoading={isSubmitting} onClick={() => onSubmit(kind, message)}>
            Enviar para revisão
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        {publishedSemver ? (
          <fieldset className={styles.locked}>
            <legend className={styles.itemLabel}>Tipo da versão</legend>
            <div className={styles.fields}>
              {KINDS.map((option) => (
                <RadioCard
                  key={option.kind}
                  name="tipo-versao"
                  value={option.kind}
                  checked={kind === option.kind}
                  title={`${option.title} · ${nextSemver(publishedSemver, option.kind)}`}
                  description={option.description}
                  onSelect={() => setKind(option.kind)}
                />
              ))}
            </div>
          </fieldset>
        ) : null}
        <TextAreaField
          label="Recado para quem revisa (opcional)"
          rows={3}
          maxLength={1000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        {error ? <Notice tone="danger">{error}</Notice> : null}
      </div>
    </Dialog>
  );
}
