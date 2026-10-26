import type { MyProfile } from '../../domain/entities/my-profile.entity';
import type { UpdateMyProfileInputDto } from '../dtos/update-my-profile-input.dto';
import type { ProfileGateway } from '../ports/profile-gateway.interface';

export class UpdateMyProfileUseCase {
  constructor(private readonly profileGateway: ProfileGateway) {}

  execute(input: UpdateMyProfileInputDto): Promise<MyProfile> {
    return this.profileGateway.updateMyProfile({
      displayName: input.displayName.trim(),
      bio: input.bio.trim(),
      links: input.links.map((link) => ({ label: link.label.trim(), url: link.url.trim() })).filter((link) => link.label || link.url),
      showStudentCount: input.showStudentCount,
    });
  }
}
