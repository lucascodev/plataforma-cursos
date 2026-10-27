import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class SetBlockedUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(personId: string, blocked: boolean): Promise<void> {
    return this.adminGateway.setBlocked(personId, blocked);
  }
}
