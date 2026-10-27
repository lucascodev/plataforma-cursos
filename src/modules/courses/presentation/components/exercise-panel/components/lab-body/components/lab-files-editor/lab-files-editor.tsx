import { useState } from 'react';
import type { ExerciseView } from '../../../../../../types/exercise/exercise-view.type';
import styles from '../../../../../../styles/exercise.module.css';

export function LabFilesEditor({ view }: { readonly view: ExerciseView }) {
  const names = Object.keys(view.files);
  const [selected, setSelected] = useState(names[0] ?? '');
  if (names.length === 0) return null;
  const current = names.includes(selected) ? selected : (names[0] ?? '');
  return (
    <div className={styles.section}>
      <div className={styles.tabs} role="tablist" aria-label="Arquivos do laboratório">
        {names.map((name) => (
          <button key={name} type="button" role="tab" aria-selected={name === current} className={styles.fileTab} onClick={() => setSelected(name)}>
            {name}
          </button>
        ))}
      </div>
      <textarea
        className={styles.editor}
        role="tabpanel"
        aria-label={`Arquivo ${current}`}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        value={view.files[current] ?? ''}
        onChange={(event) => view.setFile(current, event.target.value)}
      />
    </div>
  );
}
