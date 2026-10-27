import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import type { AdminPerson } from '../../../domain/entities/people/admin-person.entity';
import { useDeletePersonMutation } from '../use-delete-person-mutation/use-delete-person-mutation';
import { useEndSessionsMutation } from '../use-end-sessions-mutation/use-end-sessions-mutation';
import { useSetBlockedMutation } from '../use-set-blocked-mutation/use-set-blocked-mutation';

export function useAccountManagement(person: AdminPerson, onDone: () => void) {
  const toast = useToast();
  const endSessions = useEndSessionsMutation();
  const setBlocked = useSetBlockedMutation();
  const remove = useDeletePersonMutation();
  const failure = endSessions.error ?? setBlocked.error ?? remove.error;
  const finish = (text: string) => () => {
    onDone();
    toast.show({ text, tone: 'success' });
  };
  const isBlocked = person.blockedAt !== null;

  return {
    isBlocked,
    isBusy: endSessions.isPending || setBlocked.isPending || remove.isPending,
    error: failure ? readErrorMessage(failure, 'Não foi possível concluir agora.') : null,
    endSessions: () => endSessions.mutate(person.id, { onSuccess: finish(`Sessões de ${person.displayName} encerradas.`) }),
    toggleBlocked: () =>
      setBlocked.mutate(
        { personId: person.id, blocked: !isBlocked },
        { onSuccess: finish(isBlocked ? `Conta de ${person.displayName} desbloqueada.` : `Conta de ${person.displayName} bloqueada.`) },
      ),
    remove: () => remove.mutate(person.id, { onSuccess: finish('Conta excluída.') }),
  };
}
