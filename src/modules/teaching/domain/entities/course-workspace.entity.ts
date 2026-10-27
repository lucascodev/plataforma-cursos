import type { CourseVersion } from './versions/course-version.entity';
import type { OpenVersion } from './versions/open-version.entity';

export interface CourseWorkspace {
  readonly course: { readonly slug: string; readonly published: boolean; readonly listed: boolean };
  readonly publishedVersion: CourseVersion | null;
  /** What students see today; null before the first publication. Used to show what the new version changes. */
  readonly publishedContent: unknown;
  readonly openVersion: OpenVersion | null;
}
