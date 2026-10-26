import { useState, type ReactNode } from 'react';
import { Button } from '../../actions/button/button';
import { TextField } from '../../form/text-field/text-field';
import { Dialog } from '../dialog/dialog';

interface TypedConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description: ReactNode;
  readonly phrase: string;
  readonly confirmLabel: string;
  readonly isLoading?: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

// For actions that cannot be undone: the button only unlocks after the person types the phrase.
export function TypedConfirmDialog({ open, title, description, phrase, confirmLabel, isLoading = false, onConfirm, onClose }: TypedConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const close = () => {
    setTyped('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      role="alertdialog"
      title={title}
      description={description}
      onClose={close}
      actions={
        <>
          <Button size="md" onClick={close}>
            Cancelar
          </Button>
          <Button size="md" tone="danger-solid" disabled={typed.trim() !== phrase} isLoading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <TextField label={`Digite ${phrase} para confirmar`} value={typed} autoComplete="off" spellCheck={false} onChange={(event) => setTyped(event.target.value)} />
    </Dialog>
  );
}
