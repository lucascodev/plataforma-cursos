import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableExercise } from '../../../../../../../domain/entities/draft/editable-exercise.entity';
import { moveEntry } from '../../../../../../../domain/rules/list/move-entry.rule';
import { removeEntry } from '../../../../../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../../../styles/editor.module.css';
import { ItemActions } from '../../../../../item-actions/item-actions';

type LabFile = NonNullable<Extract<EditableExercise, { type: 'lab' }>['files']>[number];

const MAX_FILES = 10;

interface LabFilesEditorProps {
  readonly files: readonly LabFile[];
  readonly onChange: (files: LabFile[]) => void;
}

export function LabFilesEditor({ files, onChange }: LabFilesEditorProps) {
  return (
    <div className={styles.fields}>
      <p className={styles.itemLabel}>Arquivos iniciais</p>
      <p className={styles.muted}>A pessoa edita estes arquivos no navegador. Os testes das etapas podem importá-los pelo nome.</p>
      <ol className={styles.list}>
        {files.map((file, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.itemHeader}>
              <div className={styles.grow}>
                <TextField
                  label={`Nome do arquivo ${index + 1}`}
                  value={file.name}
                  maxLength={60}
                  spellCheck={false}
                  onChange={(event) => onChange(replaceEntry(files, index, { ...file, name: event.target.value }))}
                />
              </div>
              <ItemActions
                label={`arquivo ${index + 1}`}
                index={index}
                count={files.length}
                onMove={(delta) => onChange([...moveEntry(files, index, delta)])}
                onRemove={() => onChange(removeEntry(files, index))}
              />
            </div>
            <TextAreaField
              label="Conteúdo"
              rows={6}
              isCode
              value={file.content}
              maxLength={20_000}
              onChange={(event) => onChange(replaceEntry(files, index, { ...file, content: event.target.value }))}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button disabled={files.length >= MAX_FILES} onClick={() => onChange([...files, { name: '', content: '' }])}>
          <Plus size={16} aria-hidden="true" />
          Adicionar arquivo
        </Button>
      </div>
    </div>
  );
}
