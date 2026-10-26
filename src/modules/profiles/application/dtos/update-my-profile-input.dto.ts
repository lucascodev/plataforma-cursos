import type { ProfileLink } from '../../domain/entities/profile-link.entity';

export interface UpdateMyProfileInputDto {
  readonly displayName: string;
  readonly headline: string;
  readonly shortBio: string;
  readonly bio: string;
  readonly links: readonly ProfileLink[];
  readonly showStudentCount: boolean;
}
