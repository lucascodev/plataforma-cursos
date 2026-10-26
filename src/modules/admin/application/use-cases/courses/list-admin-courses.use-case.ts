import type { AdminCourse } from '../../../domain/entities/admin-course.entity';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class ListAdminCoursesUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(): Promise<AdminCourse[]> {
    return this.adminGateway.listCourses();
  }
}
