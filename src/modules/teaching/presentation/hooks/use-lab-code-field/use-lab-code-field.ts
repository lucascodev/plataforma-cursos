import { labCodeSchema } from '@contracts/course/exercise/lab-code.schema';
import { useState } from 'react';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import { useLabCodesQuery } from '../use-lab-codes-query/use-lab-codes-query';
import { useSetLabCodeMutation } from '../use-set-lab-code-mutation/use-set-lab-code-mutation';

// The completion code is saved on its own, right away, and is never part of the course content.
export function useLabCodeField(slug: string, itemKey: string) {
  const toast = useToast();
  const codes = useLabCodesQuery(slug);
  const mutation = useSetLabCodeMutation(slug);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const registered = codes.data?.[itemKey] ?? null;

  const send = (code: string, successText: string) => {
    setError(null);
    mutation.mutate(
      { itemKey, code },
      {
        onSuccess: () => {
          setDraft('');
          toast.show({ text: successText, tone: 'success' });
        },
        onError: (cause) => setError(readErrorMessage(cause, 'Não foi possível salvar o código agora.')),
      },
    );
  };

  return {
    registered,
    isLoading: codes.isPending,
    loadError: codes.isError ? 'Não foi possível ler os códigos cadastrados.' : null,
    draft,
    error,
    isSaving: mutation.isPending,
    setDraft: (value: string) => {
      setDraft(value);
      setError(null);
    },
    save: () => {
      const parsed = labCodeSchema.safeParse(draft);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? 'Código inválido.');
        return;
      }
      send(parsed.data, 'Código de conclusão salvo.');
    },
    remove: () => send('', 'Código de conclusão removido.'),
  };
}
