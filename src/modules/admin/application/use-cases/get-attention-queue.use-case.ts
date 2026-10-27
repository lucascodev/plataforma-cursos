import type { AttentionItem } from '../../domain/entities/attention-item.entity';
import type { AdminGateway } from '../ports/admin-gateway.interface';

export class GetAttentionQueueUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(): Promise<AttentionItem[]> {
    return this.adminGateway.getAttentionQueue();
  }
}
