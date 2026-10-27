import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class RestoreVersionUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(id: string): Promise<void> {
    return this.adminGateway.restoreVersion(id);
  }
}
