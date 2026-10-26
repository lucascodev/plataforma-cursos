import { SetCourseOwnerUseCase } from '../../../application/use-cases/courses/set-course-owner.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeSetCourseOwner(): SetCourseOwnerUseCase {
  return new SetCourseOwnerUseCase(makeAdminGateway());
}
