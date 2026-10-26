import { UpdateAccountSettingsUseCase } from '../../application/use-cases/update-account-settings.use-case';
import { makeProfileGateway } from './make-profile-gateway.factory';

export function makeUpdateAccountSettings(): UpdateAccountSettingsUseCase {
  return new UpdateAccountSettingsUseCase(makeProfileGateway());
}
