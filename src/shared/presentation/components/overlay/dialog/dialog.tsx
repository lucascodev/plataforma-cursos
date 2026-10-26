import { useEffect, useId, useRef, type MouseEvent } from 'react';
import type { DialogProps } from './dialog-props.type';
import styles from './dialog.module.css';

type DialogWithPlacementProps = DialogProps & { readonly placement?: 'center' | 'sheet' };

// The native <dialog> opened with showModal traps focus, closes on Escape and gives focus back to whatever opened it.
export function Dialog({ open, title, description, children, actions, role = 'dialog', placement = 'center', onClose }: DialogWithPlacementProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (role === 'dialog' && event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles[placement]}`}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={closeOnBackdrop}
    >
      {open ? (
        <div className={styles.content}>
          {placement === 'sheet' ? <span className={styles.handle} aria-hidden="true" /> : null}
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description ? (
            <div id={descriptionId} className={styles.description}>
              {description}
            </div>
          ) : null}
          {children}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
