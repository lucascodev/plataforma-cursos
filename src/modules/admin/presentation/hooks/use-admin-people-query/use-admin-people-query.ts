import { useQuery } from '@tanstack/react-query';
import type { PeopleFilter } from '../../../domain/types/people-filter.type';
import { makeListPeople } from '../../../main/factories/people/make-list-people.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminPeopleQuery(query: string, role: PeopleFilter | null, page: number) {
  return useQuery({
    queryKey: adminQueryKeys.people(query, role, page),
    queryFn: () => makeListPeople().execute({ query, role, page }),
    staleTime: 15_000,
  });
}
