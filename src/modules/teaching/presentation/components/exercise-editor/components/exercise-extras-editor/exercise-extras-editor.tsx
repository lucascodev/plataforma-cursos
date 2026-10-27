import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import type { EditableExercise } from '../../../../../domain/entities/draft/editable-exercise.entity';
import { SOLUTION_REVEAL_OPTIONS } from '../../../../constants/exercise/solution-reveal-options';
import styles from '../../../../styles/editor.module.css';
import { TextListEditor } from '../../../text-list-editor/text-list-editor';

type Solution = NonNullable<EditableExercise['solution']>;

const DEFAULT_REVEAL: Solution['reveal'] = 'after-done';
const orNothing = (items: string[]) => (items.length > 0 ? items : undefined);

interface ExerciseExtrasEditorProps {
  readonly exercise: EditableExercise;
  readonly onChange: (exercise: EditableExercise) => void;
}

export function ExerciseExtrasEditor({ exercise, onChange }: ExerciseExtrasEditorProps) {
  const reveal = exercise.solution?.reveal ?? DEFAULT_REVEAL;
  const isCode = exercise.type === 'code';
  return (
    <div className={styles.fields}>
      <TextListEditor
        title="Dicas (a pessoa abre uma de cada vez)"
        itemLabel="Dica"
        addLabel="Adicionar dica"
        items={exercise.hints ?? []}
        maxLength={400}
        onChange={(hints) => onChange({ ...exercise, hints: orNothing(hints) })}
      />
      <TextListEditor
        title="Pronto quando"
        itemLabel="Critério"
        addLabel="Adicionar critério"
        items={exercise.doneCriteria ?? []}
        maxLength={300}
        onChange={(doneCriteria) => onChange({ ...exercise, doneCriteria: orNothing(doneCriteria) })}
      />
      <TextListEditor
        title="Se travar"
        itemLabel="Sugestão"
        addLabel="Adicionar sugestão"
        items={exercise.stuckTips ?? []}
        maxLength={400}
        onChange={(stuckTips) => onChange({ ...exercise, stuckTips: orNothing(stuckTips) })}
      />
      <TextAreaField
        label={isCode ? 'Solução de referência (código)' : 'Solução (opcional)'}
        rows={isCode ? 8 : 4}
        isCode={isCode}
        value={exercise.solution?.text ?? ''}
        maxLength={8000}
        hint="Vai junto com o curso: é uma ajuda de estudo, não um segredo."
        onChange={(event) => onChange({ ...exercise, solution: event.target.value ? { text: event.target.value, reveal } : undefined })}
      />
      {exercise.solution ? (
        <SelectField
          label="Quando mostrar a solução"
          value={reveal}
          options={SOLUTION_REVEAL_OPTIONS}
          onChange={(event) => onChange({ ...exercise, solution: { text: exercise.solution?.text ?? '', reveal: event.target.value as Solution['reveal'] } })}
        />
      ) : null}
    </div>
  );
}
