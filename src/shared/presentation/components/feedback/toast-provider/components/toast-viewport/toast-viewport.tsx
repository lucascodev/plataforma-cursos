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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
