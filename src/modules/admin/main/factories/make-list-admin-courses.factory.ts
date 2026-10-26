import { ListAdminCoursesUseCase } from '../../application/use-cases/list-admin-courses.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeListAdminCourses(): ListAdminCoursesUseCase {
  return new ListAdminCoursesUseCase(makeAdminGateway());
}
