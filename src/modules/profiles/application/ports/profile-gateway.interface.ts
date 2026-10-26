import type { AccountSettings } from '../../domain/entities/account-settings.entity';
import type { MyProfile } from '../../domain/entities/my-profile.entity';
import type { TeacherProfile } from '../../domain/entities/teacher/teacher-profile.entity';
import type { UpdateMyProfileInputDto } from '../dtos/update-my-profile-input.dto';

export interface ProfileGateway {
  getMyProfile(): Promise<MyProfile>;
  updateMyProfile(input: UpdateMyProfileInputDto): Promise<MyProfile>;
  getAccountSettings(): Promise<AccountSettings>;
  updateAccountSettings(settings: AccountSettings): Promise<AccountSettings>;
  getTeacherProfile(handle: string): Promise<TeacherProfile | null>;
}
