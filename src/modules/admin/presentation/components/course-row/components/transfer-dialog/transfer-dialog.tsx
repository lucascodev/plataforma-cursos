import { useState } from 'react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';

interface TransferDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly isBusy: boolean;
  readonly error: string | null;
  readonly onConfirm: (handle: string) => void;
  readonly onClose: () => void;
}

export function TransferDialog({ open, title, isBusy, error, onConfirm, onClose }: TransferDialogProps) {
  const [handle, setHandle] = useState('');
  return (
    <Dialog
      open={open}
      title={`Transferir "${title}"`}
      description="O curso só vai para alguém que já é professor. A página do curso passa a mostrar o novo nome; o histórico guarda quem fez a troca."
      onClose={onClose}
      actions={
        <>
          <Button size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="md" tone="primary" isLoading={isBusy} disabled={!handle.trim()} onClick={() => onConfirm(handle)}>
            Transferir
          </Button>
        </>
      }
    >
      <TextField label="Endereço de quem vai ser responsável" placeholder="@endereco" maxLength={40} value={handle} onChange={(event) => setHandle(event.target.value)} />
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Dialog>
  );
}
