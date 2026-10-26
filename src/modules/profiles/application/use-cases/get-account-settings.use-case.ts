import type { AccountSettings } from '../../domain/entities/account-settings.entity';
import type { ProfileGateway } from '../ports/profile-gateway.interface';

export class GetAccountSettingsUseCase {
  constructor(private readonly profileGateway: ProfileGateway) {}

  execute(): Promise<AccountSettings> {
    return this.profileGateway.getAccountSettings();
  }
}
