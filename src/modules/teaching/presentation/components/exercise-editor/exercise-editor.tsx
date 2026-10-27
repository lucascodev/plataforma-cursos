import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableExercise, EditableLessonExercise } from '../../../domain/entities/draft/editable-exercise.entity';
import { changeExerciseType } from '../../../domain/rules/exercise/change-exercise-type.rule';
import { exerciseKindOf } from '../../../domain/rules/exercise/exercise-kind-of.rule';
import type { ExerciseKind } from '../../../domain/types/exercise-kind.type';
import { DELIVERY_OPTIONS } from '../../constants/exercise/delivery-options';
import { DIFFICULTY_OPTIONS } from '../../constants/exercise/difficulty-options';
import { EXERCISE_KIND_OPTIONS } from '../../constants/exercise/exercise-kind-options';
import styles from '../../styles/editor.module.css';
import { CodeExerciseEditor } from './components/code-exercise-editor/code-exercise-editor';
import { ExerciseExtrasEditor } from './components/exercise-extras-editor/exercise-extras-editor';
import { LabEditor } from './components/lab-editor/lab-editor';
import { QuizEditor } from './components/quiz-editor/quiz-editor';
import { StepsEditor } from './components/steps-editor/steps-editor';

type Difficulty = NonNullable<EditableExercise['difficulty']>;

interface ExerciseEditorProps {
  readonly exercise: EditableLessonExercise;
  readonly courseSlug: string;
  readonly itemKey: string;
  readonly onChange: (exercise: EditableLessonExercise) => void;
}

interface TypedBodyProps {
  readonly exercise: EditableExercise;
  readonly courseSlug: string;
  readonly itemKey: string;
  readonly onChange: (exercise: EditableExercise) => void;
}

function TypedBody({ exercise, courseSlug, itemKey, onChange }: TypedBodyProps) {
  switch (exercise.type) {
    case 'delivery':
      return (
        <SelectField
          label="O que a pessoa entrega"
          value={exercise.deliver}
          options={DELIVERY_OPTIONS}
          onChange={(event) => onChange({ ...exercise, deliver: event.target.value as typeof exercise.deliver })}
        />
      );
    case 'quiz':
      return <QuizEditor quiz={exercise} onChange={onChange} />;
    case 'code':
      return <CodeExerciseEditor exercise={exercise} onChange={onChange} />;
    case 'steps':
      return <StepsEditor exercise={exercise} onChange={onChange} />;
    case 'reflection':
      return (
        <TextAreaField
          label="Pergunta para o diário"
          rows={2}
          value={exercise.question}
          maxLength={600}
          hint="A resposta fica no diário da pessoa, não é enviada para ninguém."
          onChange={(event) => onChange({ ...exercise, question: event.target.value })}
        />
      );
    case 'lab':
      return <LabEditor lab={exercise} courseSlug={courseSlug} itemKey={itemKey} onChange={onChange} />;
  }
}

export function ExerciseEditor({ exercise, courseSlug, itemKey, onChange }: ExerciseEditorProps) {
  const kind = exerciseKindOf(exercise);
  const typeField = (
    <SelectField
      label="Tipo de exercício"
      value={kind}
      options={EXERCISE_KIND_OPTIONS}
      onChange={(event) => onChange(changeExerciseType(exercise, event.target.value as ExerciseKind, Math.random))}
    />
  );

  if (typeof exercise === 'string') {
    return (
      <div className={styles.fields}>
        {typeField}
        <TextAreaField label="Exercício" rows={3} value={exercise} maxLength={800} hint="O que a pessoa faz para fixar a aula." onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  return (
    <div className={styles.fields}>
      {typeField}
      <TextAreaField label="Enunciado" rows={3} value={exercise.prompt} maxLength={1200} onChange={(event) => onChange({ ...exercise, prompt: event.target.value })} />
      <div className={styles.columns}>
        <TextField
          label="Tempo estimado em minutos (opcional)"
          type="number"
          inputMode="numeric"
          min={5}
          max={600}
          value={exercise.estimatedMinutes ?? ''}
          onChange={(event) => onChange({ ...exercise, estimatedMinutes: event.target.value ? Number(event.target.value) : undefined })}
        />
        <SelectField
          label="Dificuldade"
          value={exercise.difficulty ?? ''}
          options={DIFFICULTY_OPTIONS}
          onChange={(event) => onChange({ ...exercise, difficulty: (event.target.value || undefined) as Difficulty | undefined })}
        />
      </div>
      <TypedBody exercise={exercise} courseSlug={courseSlug} itemKey={itemKey} onChange={onChange} />
      <ExerciseExtrasEditor exercise={exercise} onChange={onChange} />
    </div>
  );
}
