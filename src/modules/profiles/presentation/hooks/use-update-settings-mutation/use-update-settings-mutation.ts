import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthSession } from '@/modules/auth';
import type { AccountSettings } from '../../../domain/entities/account-settings.entity';
import { makeUpdateAccountSettings } from '../../../main/factories/make-update-account-settings.factory';
import { profileQueryKeys } from '../../query-keys/profile-query-keys';

export function useUpdateSettingsMutation() {
  const userId = useAuthSession().user?.id ?? 'signed-out';
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: AccountSettings) => makeUpdateAccountSettings().execute(settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(profileQueryKeys.settings(userId), settings);
    },
  });
}
