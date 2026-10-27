import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class CheckSlugUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(slug: string): Promise<boolean> {
    return this.adminGateway.isSlugAvailable(slug.trim().toLowerCase());
  }
}
