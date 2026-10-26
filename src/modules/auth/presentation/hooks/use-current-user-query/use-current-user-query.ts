import { useQuery } from '@tanstack/react-query';
import { makeGetCurrentUser } from '../../../main/factories/make-get-current-user.factory';
import { authQueryKeys } from '../../query-keys/auth-query-keys';

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: () => makeGetCurrentUser().execute(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
