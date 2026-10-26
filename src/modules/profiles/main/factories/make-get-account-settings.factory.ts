import { GetAccountSettingsUseCase } from '../../application/use-cases/get-account-settings.use-case';
import { makeProfileGateway } from './make-profile-gateway.factory';

export function makeGetAccountSettings(): GetAccountSettingsUseCase {
  return new GetAccountSettingsUseCase(makeProfileGateway());
}
