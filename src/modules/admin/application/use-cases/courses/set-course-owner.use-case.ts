import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class SetCourseOwnerUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(slug: string, handle: string): Promise<void> {
    return this.adminGateway.setCourseOwner(slug, handle.trim().replace(/^@/, '').toLowerCase());
  }
}
