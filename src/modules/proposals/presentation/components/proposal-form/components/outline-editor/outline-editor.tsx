import { Button } from '@/shared/presentation/components/actions/button/button';
import styles from './outline-editor.module.css';

interface OutlineEditorProps {
  modules: readonly string[];
  error?: string;
  canAdd: boolean;
  onAdd: () => void;
  onChange: (index: number, title: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, offset: -1 | 1) => void;
}

export function OutlineEditor({ modules, error, canAdd, onAdd, onChange, onRemove, onMove }: OutlineEditorProps) {
  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? 'esboco-erro' : undefined}>
      <legend className={styles.legend}>Módulos previstos</legend>
      <p className={styles.hint}>Só os títulos, na ordem em que a pessoa estudaria. Os detalhes vêm depois, no editor.</p>
      <ol className={styles.list}>
        {modules.map((title, index) => (
          <li key={index} className={styles.row}>
            <span className={styles.number}>M{index + 1}</span>
            <input
              className={styles.input}
              aria-label={`Título do módulo ${index + 1}`}
              value={title}
              maxLength={120}
              onChange={(event) => onChange(index, event.target.value)}
            />
            <Button onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Subir módulo ${index + 1}`}>
              ↑
            </Button>
            <Button onClick={() => onMove(index, 1)} disabled={index === modules.length - 1} aria-label={`Descer módulo ${index + 1}`}>
              ↓
            </Button>
            <Button onClick={() => onRemove(index)} disabled={modules.length === 1} aria-label={`Remover módulo ${index + 1}`}>
              Remover
            </Button>
          </li>
        ))}
      </ol>
      {error ? (
        <p id="esboco-erro" className={styles.error}>
          {error}
        </p>
      ) : null}
      {canAdd ? (
        <div>
          <Button onClick={onAdd}>Adicionar módulo</Button>
        </div>
      ) : null}
    </fieldset>
  );
}
