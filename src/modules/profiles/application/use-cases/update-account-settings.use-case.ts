import type { AccountSettings } from '../../domain/entities/account-settings.entity';
import type { ProfileGateway } from '../ports/profile-gateway.interface';

export class UpdateAccountSettingsUseCase {
  constructor(private readonly profileGateway: ProfileGateway) {}

  execute(settings: AccountSettings): Promise<AccountSettings> {
    return this.profileGateway.updateAccountSettings(settings);
  }
}
