import { useQuery } from '@tanstack/react-query';
import { makeGetTeacherProfile } from '../../../main/factories/make-get-teacher-profile.factory';
import { profileQueryKeys } from '../../query-keys/profile-query-keys';

export function useTeacherProfileQuery(handle: string) {
  return useQuery({
    queryKey: profileQueryKeys.teacher(handle),
    queryFn: () => makeGetTeacherProfile().execute(handle),
    staleTime: 5 * 60_000,
  });
}
