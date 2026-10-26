import { GetMyProfileUseCase } from '../../application/use-cases/get-my-profile.use-case';
import { makeProfileGateway } from './make-profile-gateway.factory';

export function makeGetMyProfile(): GetMyProfileUseCase {
  return new GetMyProfileUseCase(makeProfileGateway());
}
