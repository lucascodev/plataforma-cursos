import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/modules/auth';
import { makeGetAccountSettings } from '../../../main/factories/make-get-account-settings.factory';
import { profileQueryKeys } from '../../query-keys/profile-query-keys';

export function useAccountSettingsQuery() {
  const userId = useAuthSession().user?.id ?? null;
  return useQuery({
    queryKey: profileQueryKeys.settings(userId ?? 'signed-out'),
    queryFn: () => makeGetAccountSettings().execute(),
    enabled: userId !== null,
    staleTime: 5 * 60_000,
  });
}
