import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/modules/auth';
import { makeGetMyProfile } from '../../../main/factories/make-get-my-profile.factory';
import { profileQueryKeys } from '../../query-keys/profile-query-keys';

export function useMyProfileQuery() {
  const userId = useAuthSession().user?.id ?? null;
  return useQuery({
    queryKey: profileQueryKeys.mine(userId ?? 'signed-out'),
    queryFn: () => makeGetMyProfile().execute(),
    enabled: userId !== null,
    staleTime: 60_000,
  });
}
