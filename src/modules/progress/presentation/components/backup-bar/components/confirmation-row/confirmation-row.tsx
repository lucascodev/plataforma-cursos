import { Button } from '@/shared/presentation/components/actions/button/button';
import styles from './confirmation-row.module.css';

interface ConfirmationRowProps {
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationRow({ text, confirmLabel, onConfirm, onCancel }: ConfirmationRowProps) {
  return (
    <div className={styles.row} role="alertdialog" aria-label={confirmLabel}>
      <span>{text}</span>
      <Button tone="danger" onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button onClick={onCancel}>Cancelar</Button>
    </div>
  );
}
