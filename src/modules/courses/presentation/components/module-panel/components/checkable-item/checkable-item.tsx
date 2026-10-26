import type { ReactNode } from 'react';
import { useId } from 'react';
import styles from './checkable-item.module.css';

interface CheckableItemProps {
  number: string;
  title: string;
  isDone: boolean;
  onDoneChange: (done: boolean) => void;
  children?: ReactNode;
}

export function CheckableItem({ number, title, isDone, onDoneChange, children }: CheckableItemProps) {
  const id = useId();
  return (
    <li className={isDone ? `${styles.item} ${styles.done}` : styles.item}>
      <input id={id} type="checkbox" checked={isDone} onChange={(event) => onDoneChange(event.target.checked)} />
      <div className={styles.content}>
        <label htmlFor={id} className={styles.label}>
          <span className={styles.number}>{number}</span> {title}
        </label>
        {children}
      </div>
    </li>
  );
}
