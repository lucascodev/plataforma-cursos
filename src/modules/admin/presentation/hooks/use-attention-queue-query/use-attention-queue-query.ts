import { useQuery } from '@tanstack/react-query';
import { makeGetAttentionQueue } from '../../../main/factories/make-get-attention-queue.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAttentionQueueQuery() {
  return useQuery({ queryKey: adminQueryKeys.attention(), queryFn: () => makeGetAttentionQueue().execute(), staleTime: 15_000 });
}
