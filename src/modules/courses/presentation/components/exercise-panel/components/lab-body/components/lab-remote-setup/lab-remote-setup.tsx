import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { CodeBlock } from '@/shared/presentation/components/data/code-block/code-block';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { codespacesUrl } from '../../../../../../../domain/rules/exercise/codespaces-url.rule';
import type { ExerciseView } from '../../../../../../types/exercise/exercise-view.type';
import styles from '../../../../../../styles/exercise.module.css';

type Lab = Extract<ExerciseView['exercise'], { type: 'lab' }>;

export function LabRemoteSetup({ lab, view }: { readonly lab: Lab; readonly view: ExerciseView }) {
  const repoUrl = lab.repoUrl ?? '';
  return (
    <div className={styles.section}>
      {lab.environment === 'codespaces' ? (
        <div className={styles.item}>
          <p>
            <strong>Seu ambiente no GitHub Codespaces.</strong> Cria uma cópia do laboratório na sua conta do GitHub, com tudo instalado. Usa a cota
            gratuita da sua conta e desliga sozinho depois de um tempo parado.
          </p>
          <div>
            <ExternalLink className={styles.linkButton} href={codespacesUrl(repoUrl)}>
              <ExternalLinkIcon size={16} aria-hidden="true" /> Criar ambiente no Codespaces
            </ExternalLink>
          </div>
        </div>
      ) : (
        <div className={styles.item}>
          <p>
            <strong>No seu computador.</strong> Nada do seu computador é enviado: o script de verificação só mostra um código de conclusão.
          </p>
          <CodeBlock code={`git clone ${repoUrl}`} />
        </div>
      )}
      {lab.setup?.length ? (
        <div className={styles.section}>
          <p className={styles.muted}>Depois, dentro da pasta do laboratório:</p>
          <CodeBlock code={lab.setup.join('\n')} />
        </div>
      ) : null}
      <TextField
        label="Código de conclusão"
        hint="Rode a verificação do repositório e cole aqui o código que ela mostrar no fim."
        placeholder="LAB-XXXXXXXX"
        autoComplete="off"
        spellCheck={false}
        value={view.labCode}
        onChange={(event) => view.setLabCode(event.target.value)}
      />
      <div className={styles.actions}>
        <Button tone="primary" isLoading={view.isVerifying} disabled={!view.labCode.trim()} onClick={() => void view.verifyLabCode()}>
          Conferir código
        </Button>
      </div>
      {view.labError ? <Notice tone="warning">{view.labError}</Notice> : null}
    </div>
  );
}
