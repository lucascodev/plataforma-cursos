import { SetCourseListedUseCase } from '../../application/use-cases/set-course-listed.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeSetCourseListed(): SetCourseListedUseCase {
  return new SetCourseListedUseCase(makeAdminGateway());
}
