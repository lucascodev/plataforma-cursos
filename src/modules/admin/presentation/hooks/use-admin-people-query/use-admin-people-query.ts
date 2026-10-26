import { useQuery } from '@tanstack/react-query';
import type { AdminRole } from '../../../domain/types/admin-role.type';
import { makeListPeople } from '../../../main/factories/make-list-people.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminPeopleQuery(query: string, role: AdminRole | null, page: number) {
  return useQuery({
    queryKey: adminQueryKeys.people(query, role, page),
    queryFn: () => makeListPeople().execute({ query, role, page }),
    staleTime: 15_000,
  });
}
