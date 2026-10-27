import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableLesson } from '../../../../../../../domain/entities/draft/editable-module.entity';
import { moveEntry } from '../../../../../../../domain/rules/list/move-entry.rule';
import { replaceEntry } from '../../../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../../../styles/editor.module.css';
import { ItemActions } from '../../../../../item-actions/item-actions';

const MAX_LESSONS = 40;

interface LessonListEditorProps {
  readonly lessons: readonly EditableLesson[];
  readonly onChange: (lessons: EditableLesson[]) => void;
  readonly onAdd: () => void;
  readonly onRemove: (index: number) => void;
}

export function LessonListEditor({ lessons, onChange, onAdd, onRemove }: LessonListEditorProps) {
  const setLesson = (index: number, patch: Partial<EditableLesson>) => {
    const lesson = lessons[index];
    if (lesson) onChange(replaceEntry(lessons, index, { ...lesson, ...patch }));
  };

  return (
    <section className={styles.card} aria-labelledby="modulo-aulas">
      <h3 id="modulo-aulas" className={styles.cardTitle}>
        Aulas ({lessons.length})
      </h3>
      <p className={styles.cardHint}>Cada aula tem um id fixo: mudar a ordem não afeta o progresso de ninguém.</p>
      <ol className={styles.list}>
        {lessons.map((lesson, index) => (
          <li key={lesson.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <p className={styles.itemLabel}>
                Aula {index + 1} <span className={styles.itemId}>{lesson.id}</span>
              </p>
              <ItemActions
                label={`aula ${index + 1}`}
                index={index}
                count={lessons.length}
                onMove={(delta) => onChange([...moveEntry(lessons, index, delta)])}
                onRemove={() => onRemove(index)}
              />
            </div>
            <TextField label="Título" value={lesson.title} maxLength={120} onChange={(event) => setLesson(index, { title: event.target.value })} />
            <TextAreaField label="Resumo" rows={3} value={lesson.summary} maxLength={600} onChange={(event) => setLesson(index, { summary: event.target.value })} />
            <TextAreaField
              label="Exercício"
              rows={3}
              value={lesson.exercise}
              maxLength={800}
              hint="O que a pessoa faz para fixar a aula."
              onChange={(event) => setLesson(index, { exercise: event.target.value })}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button disabled={lessons.length >= MAX_LESSONS} onClick={onAdd}>
          <Plus size={16} aria-hidden="true" />
          Adicionar aula
        </Button>
      </div>
    </section>
  );
}
