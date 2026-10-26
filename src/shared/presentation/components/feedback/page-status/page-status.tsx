import type { ReactNode } from 'react';
import styles from './page-status.module.css';

interface PageStatusProps {
  title: string;
  children?: ReactNode;
}

export function PageStatus({ title, children }: PageStatusProps) {
  return (
    <section className={styles.status} aria-live="polite">
      <h1 className={styles.title}>{title}</h1>
      {children}
    </section>
  );
}
