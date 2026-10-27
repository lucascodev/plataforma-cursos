import { ListCourseVersionsUseCase } from '../../../application/use-cases/versions/list-course-versions.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeListCourseVersions(): ListCourseVersionsUseCase {
  return new ListCourseVersionsUseCase(makeAdminGateway());
}
