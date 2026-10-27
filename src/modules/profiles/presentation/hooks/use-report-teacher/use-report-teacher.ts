import { useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import type { ProfileReportReason } from '../../../domain/types/profile-report-reason.type';
import { useReportTeacherMutation } from '../use-report-teacher-mutation/use-report-teacher-mutation';

export function useReportTeacher(handle: string) {
  const session = useAuthSession();
  const toast = useToast();
  const report = useReportTeacherMutation();
  const [isOpen, setOpen] = useState(false);
  const [reason, setReason] = useState<ProfileReportReason>('false-info');
  const [details, setDetails] = useState('');

  const close = () => {
    setOpen(false);
    report.reset();
  };

  return {
    isOwnProfile: session.user?.handle === handle,
    isOpen,
    reason,
    details,
    isSending: report.isPending,
    error: report.error ? readErrorMessage(report.error, 'Não foi possível enviar o aviso agora.') : null,
    setReason,
    setDetails,
    open: () => (session.user ? setOpen(true) : session.signIn(`/professores/${handle}`)),
    close,
    send: () =>
      report.mutate(
        { handle, reason, details },
        {
          onSuccess: () => {
            close();
            setDetails('');
            toast.show({ text: 'Aviso enviado. A equipe vai olhar.', tone: 'success' });
          },
        },
      ),
  };
}
