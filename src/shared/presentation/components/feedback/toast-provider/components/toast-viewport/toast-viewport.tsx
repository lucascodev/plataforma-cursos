import { X } from 'lucide-react';
import type { ToastMessage } from '../../../../../types/toast/toast-message.type';
import styles from './toast-viewport.module.css';

interface ToastViewportProps {
  readonly toasts: readonly ToastMessage[];
  readonly onDismiss: (id: number) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className={styles.viewport} role="region" aria-label="Avisos" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.tone ?? 'success']}`} role="status">
          <span className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>{toast.text}</span>
          {toast.action ? (
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                toast.action?.onAction();
                onDismiss(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          ) : null}
          <button type="button" className={styles.close} aria-label="Fechar aviso" onClick={() => onDismiss(toast.id)}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
