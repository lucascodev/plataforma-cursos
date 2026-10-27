import { useQuery } from '@tanstack/react-query';
import { makeGetNavBadges } from '../../../main/factories/make-get-nav-badges.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useNavBadgesQuery() {
  return useQuery({ queryKey: adminQueryKeys.badges(), queryFn: () => makeGetNavBadges().execute(), staleTime: 30_000 });
}
