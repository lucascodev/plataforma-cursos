import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableExercise } from '../../../../../../../domain/entities/draft/editable-exercise.entity';
import { createQuizOption } from '../../../../../../../domain/rules/exercise/create-quiz-option.rule';
import { removeQuizOption } from '../../../../../../../domain/rules/exercise/remove-quiz-option.rule';
import { replaceEntry } from '../../../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../../../styles/editor.module.css';

type QuizQuestion = Extract<EditableExercise, { type: 'quiz' }>['questions'][number];

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

interface QuizQuestionEditorProps {
  readonly question: QuizQuestion;
  readonly number: number;
  readonly onChange: (question: QuizQuestion) => void;
}

export function QuizQuestionEditor({ question, number, onChange }: QuizQuestionEditorProps) {
  return (
    <div className={styles.fields}>
      <TextAreaField label="Pergunta" rows={2} value={question.text} maxLength={400} onChange={(event) => onChange({ ...question, text: event.target.value })} />
      <fieldset className={styles.locked}>
        <legend className={styles.itemLabel}>Opções (marque a certa)</legend>
        <ol className={styles.list}>
          {question.options.map((option, index) => (
            <li key={option.id} className={styles.itemHeader}>
              <input
                type="radio"
                name={`certa-${question.id}`}
                aria-label={`Opção ${index + 1} é a certa`}
                checked={question.correct === option.id}
                onChange={() => onChange({ ...question, correct: option.id })}
              />
              <div className={styles.grow}>
                <TextField
                  label={`Opção ${index + 1}`}
                  value={option.text}
                  maxLength={200}
                  onChange={(event) => onChange({ ...question, options: replaceEntry(question.options, index, { ...option, text: event.target.value }) })}
                />
              </div>
              <Button
                tone="ghost"
                aria-label={`Remover opção ${index + 1} da pergunta ${number}`}
                disabled={question.options.length <= MIN_OPTIONS}
                onClick={() => onChange(removeQuizOption(question, index))}
              >
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ol>
      </fieldset>
      <div>
        <Button
          disabled={question.options.length >= MAX_OPTIONS}
          onClick={() => onChange({ ...question, options: [...question.options, createQuizOption(question.options, Math.random)] })}
        >
          <Plus size={16} aria-hidden="true" />
          Adicionar opção
        </Button>
      </div>
      <TextAreaField
        label="Explicação (opcional)"
        rows={2}
        value={question.explanation ?? ''}
        maxLength={600}
        hint="Aparece depois que a pessoa confere as respostas."
        onChange={(event) => onChange({ ...question, explanation: event.target.value || undefined })}
      />
    </div>
  );
}
