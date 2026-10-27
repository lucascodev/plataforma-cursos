import type { PersonCard } from '../people/person-card.entity';
import type { AdminCourseVersion } from './admin-course-version.entity';

export interface AdminVersionDetail {
  readonly version: AdminCourseVersion & { readonly content: unknown };
  readonly course: {
    readonly slug: string;
    readonly title: string;
    readonly published: boolean;
    readonly owner: PersonCard | null;
    readonly studentCount: number;
  };
  /** What students see today; null before the first publication. */
  readonly publishedContent: unknown;
}
