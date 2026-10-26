import type { ReactNode } from 'react';
import styles from './radio-card.module.css';

interface RadioCardProps {
  readonly name: string;
  readonly value: string;
  readonly checked: boolean;
  readonly title: string;
  readonly description?: ReactNode;
  readonly onSelect: (value: string) => void;
}

export function RadioCard({ name, value, checked, title, description, onSelect }: RadioCardProps) {
  return (
    <label className={checked ? `${styles.card} ${styles.checked}` : styles.card}>
      <input className={styles.input} type="radio" name={name} value={value} checked={checked} onChange={() => onSelect(value)} />
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
    </label>
  );
}
