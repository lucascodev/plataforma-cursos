import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableResource } from '../../../../../../../domain/entities/draft/editable-module.entity';
import { moveEntry } from '../../../../../../../domain/rules/list/move-entry.rule';
import { removeEntry } from '../../../../../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../../../../../domain/rules/list/replace-entry.rule';
import styles from '../../../../../../styles/editor.module.css';
import { ItemActions } from '../../../../../item-actions/item-actions';

const MAX_RESOURCES = 30;
const EMPTY_RESOURCE: EditableResource = { type: 'doc', label: '', url: '' };

interface ResourceListEditorProps {
  readonly resources: readonly EditableResource[];
  readonly onChange: (resources: EditableResource[]) => void;
}

export function ResourceListEditor({ resources, onChange }: ResourceListEditorProps) {
  const setResource = (index: number, patch: Partial<EditableResource>) => {
    const resource = resources[index];
    if (resource) onChange(replaceEntry(resources, index, { ...resource, ...patch }));
  };

  return (
    <section className={styles.card} aria-labelledby="modulo-material">
      <h3 id="modulo-material" className={styles.cardTitle}>
        Material de apoio
      </h3>
      <p className={styles.cardHint}>Links para documentação, papers e vídeos. Material de terceiros entra como link, nunca copiado.</p>
      <ol className={styles.list}>
        {resources.map((resource, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.itemHeader}>
              <p className={styles.itemLabel}>Material {index + 1}</p>
              <ItemActions
                label={`material ${index + 1}`}
                index={index}
                count={resources.length}
                onMove={(delta) => onChange([...moveEntry(resources, index, delta)])}
                onRemove={() => onChange(removeEntry(resources, index))}
              />
            </div>
            <div className={styles.columns}>
              <TextField label="Nome" value={resource.label} maxLength={200} onChange={(event) => setResource(index, { label: event.target.value })} />
              <TextField label="Tipo" value={resource.type} maxLength={20} hint="doc, paper, vídeo…" onChange={(event) => setResource(index, { type: event.target.value })} />
            </div>
            <TextField
              label="Link"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={resource.url}
              onChange={(event) => setResource(index, { url: event.target.value.trim() })}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button disabled={resources.length >= MAX_RESOURCES} onClick={() => onChange([...resources, EMPTY_RESOURCE])}>
          <Plus size={16} aria-hidden="true" />
          Adicionar material
        </Button>
      </div>
    </section>
  );
}
