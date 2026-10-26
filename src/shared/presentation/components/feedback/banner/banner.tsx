import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './banner.module.css';

interface BannerProps {
  readonly tone?: 'info' | 'accent' | 'warning' | 'danger';
  readonly title?: string;
  readonly children?: ReactNode;
  readonly action?: ReactNode;
  readonly onDismiss?: () => void;
}

export function Banner({ tone = 'info', title, children, action, onDismiss }: BannerProps) {
  return (
    <div className={`${styles.banner} ${styles[tone]}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.text}>{children}</div> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
      {onDismiss ? (
        <button type="button" className={styles.dismiss} aria-label="Fechar aviso" onClick={onDismiss}>
          <X size={18} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
