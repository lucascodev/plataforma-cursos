import type { ProfileLink } from '../profile-link.entity';
import type { TeacherCourse } from './teacher-course.entity';

export interface TeacherProfile {
  readonly handle: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly headline: string;
  readonly shortBio: string;
  readonly bio: string;
  readonly links: readonly ProfileLink[];
  readonly courses: readonly TeacherCourse[];
  readonly studentCount: number | null;
}
