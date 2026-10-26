import type { MyProfile } from '../../domain/entities/my-profile.entity';
import type { ProfileGateway } from '../ports/profile-gateway.interface';

export class GetMyProfileUseCase {
  constructor(private readonly profileGateway: ProfileGateway) {}

  execute(): Promise<MyProfile> {
    return this.profileGateway.getMyProfile();
  }
}
