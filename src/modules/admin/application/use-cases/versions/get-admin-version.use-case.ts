import type { AdminVersionDetail } from '../../../domain/entities/versions/admin-version-detail.entity';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class GetAdminVersionUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(id: string): Promise<AdminVersionDetail | null> {
    return this.adminGateway.getVersion(id);
  }
}
