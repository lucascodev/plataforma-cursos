import type { CourseVersion } from './course-version.entity';

// The draft content may be incomplete, so it stays unknown until normalizeCourseDraft reads it.
export interface OpenVersion extends CourseVersion {
  readonly content: unknown;
}
