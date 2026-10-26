import { UpdateMyProfileUseCase } from '../../application/use-cases/update-my-profile.use-case';
import { makeProfileGateway } from './make-profile-gateway.factory';

export function makeUpdateMyProfile(): UpdateMyProfileUseCase {
  return new UpdateMyProfileUseCase(makeProfileGateway());
}
