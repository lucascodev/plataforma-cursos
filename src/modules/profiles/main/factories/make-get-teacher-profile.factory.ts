import { GetTeacherProfileUseCase } from '../../application/use-cases/get-teacher-profile.use-case';
import { makeProfileGateway } from './make-profile-gateway.factory';

export function makeGetTeacherProfile(): GetTeacherProfileUseCase {
  return new GetTeacherProfileUseCase(makeProfileGateway());
}
