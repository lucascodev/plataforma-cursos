import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableExercise } from '../../../../../domain/entities/draft/editable-exercise.entity';
import { createQuizQuestion } from '../../../../../domain/rules/exercise/create-quiz-question.rule';
import { moveEntry } from '../../../../../domain/rules/list/move-entry.rule';
import { removeEntry } from '../../../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../styles/editor.module.css';
import { ItemActions } from '../../../item-actions/item-actions';
import { QuizQuestionEditor } from './components/quiz-question-editor/quiz-question-editor';

type Quiz = Extract<EditableExercise, { type: 'quiz' }>;

const MAX_QUESTIONS = 20;

export function QuizEditor({ quiz, onChange }: { readonly quiz: Quiz; readonly onChange: (quiz: Quiz) => void }) {
  return (
    <div className={styles.fields}>
      <ol className={styles.list}>
        {quiz.questions.map((question, index) => (
          <li key={question.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <p className={styles.itemLabel}>
                Pergunta {index + 1} <span className={styles.itemId}>{question.id}</span>
              </p>
              <ItemActions
                label={`pergunta ${index + 1}`}
                index={index}
                count={quiz.questions.length}
                onMove={(delta) => onChange({ ...quiz, questions: [...moveEntry(quiz.questions, index, delta)] })}
                onRemove={() => onChange({ ...quiz, questions: removeEntry(quiz.questions, index) })}
              />
            </div>
            <QuizQuestionEditor
              question={question}
              number={index + 1}
              onChange={(next) => onChange({ ...quiz, questions: replaceEntry(quiz.questions, index, next) })}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button
          disabled={quiz.questions.length >= MAX_QUESTIONS}
          onClick={() => onChange({ ...quiz, questions: [...quiz.questions, createQuizQuestion(quiz.questions, Math.random)] })}
        >
          <Plus size={16} aria-hidden="true" />
          Adicionar pergunta
        </Button>
      </div>
      <TextField
        label="Acertos para concluir (opcional)"
        type="number"
        inputMode="numeric"
        min={1}
        max={quiz.questions.length}
        value={quiz.passing ?? ''}
        hint="Sem valor, a pessoa precisa acertar todas."
        onChange={(event) => onChange({ ...quiz, passing: event.target.value ? Number(event.target.value) : undefined })}
      />
    </div>
  );
}
