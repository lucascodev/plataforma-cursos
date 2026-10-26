import type { ReactNode } from 'react';
import styles from './notice.module.css';

interface NoticeProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
}

// Warnings and errors interrupt screen readers; information and success are announced politely.
export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === 'warning' || tone === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
