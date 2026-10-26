import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class SetCourseListedUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(slug: string, listed: boolean): Promise<void> {
    return this.adminGateway.setCourseListed(slug, listed);
  }
}
