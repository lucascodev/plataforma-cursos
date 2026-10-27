import { GetCourseWorkspaceUseCase } from '../../application/use-cases/get-course-workspace.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeGetCourseWorkspace(): GetCourseWorkspaceUseCase {
  return new GetCourseWorkspaceUseCase(makeTeachingGateway());
}
