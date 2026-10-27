import { useState } from 'react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import type { UnlistReason } from '../../../../../domain/types/unlist-reason.type';
import { UNLIST_REASON_LABELS } from '../../../../formatters/describe-unlist-reason';

const REASONS = Object.entries(UNLIST_REASON_LABELS).map(([value, label]) => ({ value, label }));

interface UnlistDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly isBusy: boolean;
  readonly error: string | null;
  readonly onConfirm: (reason: UnlistReason, note: string) => void;
  readonly onClose: () => void;
}

export function UnlistDialog({ open, title, isBusy, error, onConfirm, onClose }: UnlistDialogProps) {
  const [reason, setReason] = useState<UnlistReason>('outdated');
  const [note, setNote] = useState('');
  return (
    <Dialog
      open={open}
      title={`Tirar "${title}" do catálogo?`}
      description="O curso some do catálogo e não aceita pessoas novas. Quem já estuda continua com acesso e com o progresso. Dá para voltar ao catálogo depois."
      onClose={onClose}
      actions={
        <>
          <Button size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="md" tone="danger-solid" isLoading={isBusy} onClick={() => onConfirm(reason, note)}>
            Tirar do catálogo
          </Button>
        </>
      }
    >
      <SelectField label="Motivo (fica no histórico)" options={REASONS} value={reason} onChange={(event) => setReason(event.target.value as UnlistReason)} />
      <TextAreaField label="Nota para a equipe (opcional)" rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Dialog>
  );
}
