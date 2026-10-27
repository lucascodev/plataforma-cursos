import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import { moveEntry } from '../../../domain/rules/list/move-entry.rule';
import { removeEntry } from '../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../domain/rules/list/replace-entry.rule';
import styles from '../../styles/editor.module.css';
import { ItemActions } from '../item-actions/item-actions';

interface TextListEditorProps {
  readonly title: string;
  readonly itemLabel: string;
  readonly addLabel: string;
  readonly items: readonly string[];
  readonly maxLength: number;
  readonly onChange: (items: string[]) => void;
}

export function TextListEditor({ title, itemLabel, addLabel, items, maxLength, onChange }: TextListEditorProps) {
  return (
    <div className={styles.fields}>
      <p className={styles.itemLabel}>{title}</p>
      {items.length === 0 ? <p className={styles.muted}>Nenhum item ainda.</p> : null}
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.itemHeader}>
            <div className={styles.grow}>
              <TextField
                label={`${itemLabel} ${index + 1}`}
                value={item}
                maxLength={maxLength}
                onChange={(event) => onChange(replaceEntry(items, index, event.target.value))}
              />
            </div>
            <ItemActions
              label={`${itemLabel.toLowerCase()} ${index + 1}`}
              index={index}
              count={items.length}
              onMove={(delta) => onChange([...moveEntry(items, index, delta)])}
              onRemove={() => onChange(removeEntry(items, index))}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button onClick={() => onChange([...items, ''])}>
          <Plus size={16} aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
