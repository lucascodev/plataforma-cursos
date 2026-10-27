import { GetAttentionQueueUseCase } from '../../application/use-cases/get-attention-queue.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeGetAttentionQueue(): GetAttentionQueueUseCase {
  return new GetAttentionQueueUseCase(makeAdminGateway());
}
