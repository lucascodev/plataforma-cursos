import type { CourseVersion } from './versions/course-version.entity';

export interface TeacherCourse {
  readonly slug: string;
  readonly title: string;
  readonly published: boolean;
  readonly listed: boolean;
  readonly publishedVersion: CourseVersion | null;
  readonly openVersion: CourseVersion | null;
  /** null: fewer than 5 people. */
  readonly studentCount: number | null;
  readonly updatedAt: string;
}
