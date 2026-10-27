import type { AdminCourse } from '../../../domain/entities/admin-course.entity';
import type { ListCoursesInputDto } from '../../dtos/list-courses-input.dto';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class ListAdminCoursesUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(input: ListCoursesInputDto): Promise<AdminCourse[]> {
    return this.adminGateway.listCourses({ ...input, query: input.query.trim() });
  }
}
