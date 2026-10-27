import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class EndSessionsUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(personId: string): Promise<void> {
    return this.adminGateway.endSessions(personId);
  }
}
