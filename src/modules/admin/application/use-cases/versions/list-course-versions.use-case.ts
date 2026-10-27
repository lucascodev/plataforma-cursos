import type { AdminCourseVersion } from '../../../domain/entities/versions/admin-course-version.entity';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class ListCourseVersionsUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(slug: string): Promise<AdminCourseVersion[]> {
    return this.adminGateway.listVersions(slug);
  }
}
