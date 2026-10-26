import type { TeacherProfile } from '../../domain/entities/teacher/teacher-profile.entity';
import type { ProfileGateway } from '../ports/profile-gateway.interface';

export class GetTeacherProfileUseCase {
  constructor(private readonly profileGateway: ProfileGateway) {}

  execute(handle: string): Promise<TeacherProfile | null> {
    return this.profileGateway.getTeacherProfile(handle.toLowerCase());
  }
}
