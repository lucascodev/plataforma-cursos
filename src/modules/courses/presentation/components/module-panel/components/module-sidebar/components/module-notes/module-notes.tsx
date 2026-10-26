import { progressLimits } from '@/modules/progress';
import { useId } from 'react';
import styles from './module-notes.module.css';

interface ModuleNotesProps {
  value: string;
  onChange: (text: string) => void;
}

export function ModuleNotes({ value, onChange }: ModuleNotesProps) {
  const id = useId();
  return (
    <div className={styles.notes}>
      <label htmlFor={id} className={styles.label}>
        Suas anotações do módulo
      </label>
      <textarea
        id={id}
        className={styles.field}
        value={value}
        maxLength={progressLimits.maxTextLength}
        placeholder="Links, dúvidas, decisões do projeto."
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
