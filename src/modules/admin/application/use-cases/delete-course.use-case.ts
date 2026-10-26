import type { AdminGateway } from '../ports/admin-gateway.interface';

export class DeleteCourseUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(slug: string): Promise<void> {
    return this.adminGateway.deleteCourse(slug);
  }
}
