import { progressLimits } from '@/modules/progress';
import { useId } from 'react';
import styles from './journal-field.module.css';

interface JournalFieldProps {
  value: string;
  onChange: (text: string) => void;
}

export function JournalField({ value, onChange }: JournalFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        Diário do dia
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={progressLimits.maxTextLength}
        placeholder="O que você estudou, o que travou, o que ficou para amanhã."
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
