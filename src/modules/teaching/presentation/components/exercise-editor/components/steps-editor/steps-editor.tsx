import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableExercise } from '../../../../../domain/entities/draft/editable-exercise.entity';
import { createExerciseStep } from '../../../../../domain/rules/exercise/create-exercise-step.rule';
import { moveEntry } from '../../../../../domain/rules/list/move-entry.rule';
import { removeEntry } from '../../../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../styles/editor.module.css';
import { ItemActions } from '../../../item-actions/item-actions';

type Steps = Extract<EditableExercise, { type: 'steps' }>;
type Step = Steps['steps'][number];

const MAX_STEPS = 20;

export function StepsEditor({ exercise, onChange }: { readonly exercise: Steps; readonly onChange: (exercise: Steps) => void }) {
  const setStep = (index: number, step: Step) => onChange({ ...exercise, steps: replaceEntry(exercise.steps, index, step) });
  return (
    <div className={styles.fields}>
      <ol className={styles.list}>
        {exercise.steps.map((step, index) => (
          <li key={step.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <p className={styles.itemLabel}>
                Passo {index + 1} <span className={styles.itemId}>{step.id}</span>
              </p>
              <ItemActions
                label={`passo ${index + 1}`}
                index={index}
                count={exercise.steps.length}
                onMove={(delta) => onChange({ ...exercise, steps: [...moveEntry(exercise.steps, index, delta)] })}
                onRemove={() => onChange({ ...exercise, steps: removeEntry(exercise.steps, index) })}
              />
            </div>
            <TextField label="Título" value={step.title} maxLength={200} onChange={(event) => setStep(index, { ...step, title: event.target.value })} />
            <TextAreaField
              label="Detalhe (opcional)"
              rows={2}
              value={step.detail ?? ''}
              maxLength={800}
              onChange={(event) => setStep(index, { ...step, detail: event.target.value || undefined })}
            />
            <TextAreaField
              label="Comando ou código (opcional)"
              rows={3}
              isCode
              value={step.code ?? ''}
              maxLength={4000}
              hint="Aparece num bloco com botão de copiar."
              onChange={(event) => setStep(index, { ...step, code: event.target.value || undefined })}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button
          disabled={exercise.steps.length >= MAX_STEPS}
          onClick={() => onChange({ ...exercise, steps: [...exercise.steps, createExerciseStep(exercise.steps, Math.random)] })}
        >
          <Plus size={16} aria-hidden="true" />
          Adicionar passo
        </Button>
      </div>
    </div>
  );
}
