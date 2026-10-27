import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthSession } from '@/modules/auth';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';

type Confirming = 'sessions' | 'delete' | null;

export function useAccountActions() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [isBusy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const signOutEverywhere = async () => {
    setBusy(true);
    await session.signOutEverywhere();
    setBusy(false);
    setConfirming(null);
    void navigate('/');
  };

  const deleteAccount = async () => {
    setBusy(true);
    setDeleteError(null);
    try {
      await session.deleteAccount();
      toast.show({ text: 'Sua conta foi excluída.', tone: 'info' });
      void navigate('/');
    } catch (error) {
      setDeleteError(readErrorMessage(error, 'Não foi possível excluir a conta agora.'));
      setConfirming(null);
    } finally {
      setBusy(false);
    }
  };

  return {
    isTeacher: session.user?.role === 'teacher' || session.user?.role === 'admin',
    confirming,
    isBusy,
    deleteError,
    askSignOutEverywhere: () => setConfirming('sessions'),
    askDelete: () => setConfirming('delete'),
    cancel: () => setConfirming(null),
    signOutEverywhere,
    deleteAccount,
  };
}
