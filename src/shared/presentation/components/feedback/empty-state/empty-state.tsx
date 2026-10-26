import type { ReactNode } from 'react';
import styles from './empty-state.module.css';

interface EmptyStateProps {
  readonly title: string;
  readonly children?: ReactNode;
  readonly action?: ReactNode;
}

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {children ? <div className={styles.text}>{children}</div> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
