import type { PersonCard } from './people/person-card.entity';
import type { AdminCourseVersion } from './versions/admin-course-version.entity';

export interface AdminCourse {
  readonly slug: string;
  readonly title: string;
  readonly version: string | null;
  readonly published: boolean;
  readonly listed: boolean;
  readonly owner: PersonCard | null;
  readonly studentCount: number;
  readonly active7d: number;
  readonly unlistedNote: string | null;
  readonly updatedAt: string;
  readonly openVersion: AdminCourseVersion | null;
}
