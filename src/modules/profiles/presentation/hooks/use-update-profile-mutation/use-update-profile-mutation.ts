import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthSession } from '@/modules/auth';
import type { UpdateMyProfileInputDto } from '../../../application/dtos/update-my-profile-input.dto';
import { makeUpdateMyProfile } from '../../../main/factories/make-update-my-profile.factory';
import { profileQueryKeys } from '../../query-keys/profile-query-keys';

export function useUpdateProfileMutation() {
  const session = useAuthSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMyProfileInputDto) => makeUpdateMyProfile().execute(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKeys.mine(profile.id), profile);
      void queryClient.invalidateQueries({ queryKey: profileQueryKeys.teacher(profile.handle) });
      session.refresh();
    },
  });
}
