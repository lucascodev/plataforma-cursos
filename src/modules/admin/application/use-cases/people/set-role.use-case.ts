import type { AdminRole } from '../../../domain/types/admin-role.type';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class SetRoleUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(personId: string, role: AdminRole): Promise<void> {
    return this.adminGateway.setRole(personId, role);
  }
}
