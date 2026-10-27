import type { VersionImpact } from '../../../domain/entities/versions/version-impact.entity';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class GetVersionImpactUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(id: string): Promise<VersionImpact> {
    return this.adminGateway.getVersionImpact(id);
  }
}
