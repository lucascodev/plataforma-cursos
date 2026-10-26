import { DeleteCourseUseCase } from '../../../application/use-cases/courses/delete-course.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeDeleteCourse(): DeleteCourseUseCase {
  return new DeleteCourseUseCase(makeAdminGateway());
}
