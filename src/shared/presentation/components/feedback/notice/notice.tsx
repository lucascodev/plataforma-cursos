import type { ReactNode } from 'react';
import styles from './notice.module.css';

interface NoticeProps {
  tone?: 'info' | 'success' | 'warning';
  children: ReactNode;
}

// Warnings interrupt screen readers; information and success are announced politely.
export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === 'warning' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
