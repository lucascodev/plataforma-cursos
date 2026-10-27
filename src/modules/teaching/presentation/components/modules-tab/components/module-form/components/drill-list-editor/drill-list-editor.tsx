import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableDrill } from '../../../../../../../domain/entities/draft/editable-module.entity';
import { moveEntry } from '../../../../../../../domain/rules/list/move-entry.rule';
import { replaceEntry } from '../../../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../../../styles/editor.module.css';
import { ItemActions } from '../../../../../item-actions/item-actions';

const MAX_DRILLS = 20;

interface DrillListEditorProps {
  readonly drills: readonly EditableDrill[];
  readonly onChange: (drills: EditableDrill[]) => void;
  readonly onAdd: () => void;
  readonly onRemove: (index: number) => void;
}

export function DrillListEditor({ drills, onChange, onAdd, onRemove }: DrillListEditorProps) {
  const setDrill = (index: number, patch: Partial<EditableDrill>) => {
    const drill = drills[index];
    if (drill) onChange(replaceEntry(drills, index, { ...drill, ...patch }));
  };

  return (
    <section className={styles.card} aria-labelledby="modulo-fixacao">
      <h3 id="modulo-fixacao" className={styles.cardTitle}>
        Exercícios de fixação ({drills.length})
      </h3>
      <ol className={styles.list}>
        {drills.map((drill, index) => (
          <li key={drill.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <p className={styles.itemLabel}>
                Exercício {index + 1} <span className={styles.itemId}>{drill.id}</span>
              </p>
              <ItemActions
                label={`exercício ${index + 1}`}
                index={index}
                count={drills.length}
                onMove={(delta) => onChange([...moveEntry(drills, index, delta)])}
                onRemove={() => onRemove(index)}
              />
            </div>
            <TextField label="Título" value={drill.title} maxLength={120} onChange={(event) => setDrill(index, { title: event.target.value })} />
            <TextAreaField label="Tarefa" rows={3} value={drill.task} maxLength={800} onChange={(event) => setDrill(index, { task: event.target.value })} />
          </li>
        ))}
      </ol>
      <div>
        <Button disabled={drills.length >= MAX_DRILLS} onClick={onAdd}>
          <Plus size={16} aria-hidden="true" />
          Adicionar exercício
        </Button>
      </div>
    </section>
  );
}
