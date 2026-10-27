import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableExercise } from '../../../../../../../domain/entities/draft/editable-exercise.entity';
import { createLabCheck } from '../../../../../../../domain/rules/exercise/create-lab-check.rule';
import { moveEntry } from '../../../../../../../domain/rules/list/move-entry.rule';
import { removeEntry } from '../../../../../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../../../styles/editor.module.css';
import { ItemActions } from '../../../../../item-actions/item-actions';

type LabCheck = Extract<EditableExercise, { type: 'lab' }>['checks'][number];

const MAX_CHECKS = 15;

interface LabChecksEditorProps {
  readonly checks: readonly LabCheck[];
  readonly hasTests: boolean;
  readonly onChange: (checks: LabCheck[]) => void;
}

export function LabChecksEditor({ checks, hasTests, onChange }: LabChecksEditorProps) {
  return (
    <div className={styles.fields}>
      <p className={styles.itemLabel}>Etapas</p>
      <p className={styles.muted}>
        {hasTests
          ? 'Cada etapa tem um teste curto, que passa quando não dá erro (use assert).'
          : 'As etapas aparecem como lista. O script de verificação do repositório confere todas e mostra o código de conclusão.'}
      </p>
      <ol className={styles.list}>
        {checks.map((check, index) => (
          <li key={check.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <div className={styles.grow}>
                <TextField
                  label={`Etapa ${index + 1}`}
                  value={check.title}
                  maxLength={200}
                  onChange={(event) => onChange(replaceEntry(checks, index, { ...check, title: event.target.value }))}
                />
              </div>
              <ItemActions
                label={`etapa ${index + 1}`}
                index={index}
                count={checks.length}
                onMove={(delta) => onChange([...moveEntry(checks, index, delta)])}
                onRemove={() => onChange(removeEntry(checks, index))}
              />
            </div>
            {hasTests ? (
              <TextAreaField
                label="Teste"
                rows={4}
                isCode
                value={check.test ?? ''}
                maxLength={10_000}
                onChange={(event) => onChange(replaceEntry(checks, index, { ...check, test: event.target.value }))}
              />
            ) : null}
          </li>
        ))}
      </ol>
      <div>
        <Button disabled={checks.length >= MAX_CHECKS} onClick={() => onChange([...checks, createLabCheck(checks, Math.random)])}>
          <Plus size={16} aria-hidden="true" />
          Adicionar etapa
        </Button>
      </div>
    </div>
  );
}
