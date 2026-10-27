import { Button } from '@/shared/presentation/components/actions/button/button';
import type { ProfileLink } from '../../../../../domain/entities/profile-link.entity';
import type { ProfileLinkKind } from '../../../../../domain/types/profile-link-kind.type';
import styles from './links-editor.module.css';

const KINDS: readonly { readonly value: ProfileLinkKind; readonly label: string }[] = [
  { value: 'site', label: 'Site' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'other', label: 'Outro' },
];

interface LinksEditorProps {
  links: readonly ProfileLink[];
  canAdd: boolean;
  onAdd: () => void;
  onChange: (index: number, patch: Partial<ProfileLink>) => void;
  onRemove: (index: number) => void;
}

export function LinksEditor({ links, canAdd, onAdd, onChange, onRemove }: LinksEditorProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Links (até 5)</legend>
      {links.length === 0 ? <p className={styles.empty}>Nenhum link ainda. GitHub, site ou LinkedIn ajudam quem quer conhecer seu trabalho.</p> : null}
      {links.map((link, index) => (
        <div key={index} className={styles.row}>
          <select
            className={styles.input}
            aria-label={`Tipo do link ${index + 1}`}
            value={link.kind ?? 'other'}
            onChange={(event) => onChange(index, { kind: event.target.value as ProfileLinkKind })}
          >
            {KINDS.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            aria-label={`Nome do link ${index + 1}`}
            placeholder="Nome (ex.: GitHub)"
            value={link.label}
            maxLength={40}
            onChange={(event) => onChange(index, { label: event.target.value })}
          />
          <input
            className={styles.input}
            aria-label={`Endereço do link ${index + 1}`}
            placeholder="https://"
            type="url"
            inputMode="url"
            value={link.url}
            maxLength={300}
            onChange={(event) => onChange(index, { url: event.target.value })}
          />
          <Button onClick={() => onRemove(index)} aria-label={`Remover link ${index + 1}`}>
            Remover
          </Button>
        </div>
      ))}
      {canAdd ? <Button onClick={onAdd}>Adicionar link</Button> : null}
    </fieldset>
  );
}
