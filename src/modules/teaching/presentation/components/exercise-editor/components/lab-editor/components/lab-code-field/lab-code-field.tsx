import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import { useLabCodeField } from '../../../../../../hooks/use-lab-code-field/use-lab-code-field';
import styles from '../../../../../../styles/editor.module.css';

interface LabCodeFieldProps {
  readonly courseSlug: string;
  readonly itemKey: string;
}

export function LabCodeField({ courseSlug, itemKey }: LabCodeFieldProps) {
  const field = useLabCodeField(courseSlug, itemKey);
  return (
    <div className={styles.item}>
      <p className={styles.itemLabel}>Código de conclusão</p>
      <p className={styles.muted}>
        Rode o script de verificação do repositório com a solução certa e cadastre o código que ele mostrar. O código fica só no banco,
        fora do conteúdo do curso, e vale assim que a versão for publicada.
      </p>
      {field.loadError ? <Notice tone="warning">{field.loadError}</Notice> : null}
      {field.isLoading ? null : (
        <p className={styles.muted}>
          {field.registered ? (
            <>
              Cadastrado: <span className={styles.itemId}>{field.registered}</span>
            </>
          ) : (
            'Nenhum código cadastrado ainda: ninguém consegue concluir este laboratório.'
          )}
        </p>
      )}
      <TextField
        label={field.registered ? 'Trocar o código' : 'Código'}
        placeholder="LAB-XXXXXXXX"
        autoComplete="off"
        spellCheck={false}
        value={field.draft}
        error={field.error}
        onChange={(event) => field.setDraft(event.target.value)}
      />
      <div className={styles.actions}>
        <Button tone="primary" isLoading={field.isSaving} disabled={!field.draft.trim()} onClick={field.save}>
          Salvar código
        </Button>
        {field.registered ? (
          <Button tone="ghost" disabled={field.isSaving} onClick={field.remove}>
            Remover código
          </Button>
        ) : null}
      </div>
    </div>
  );
}
