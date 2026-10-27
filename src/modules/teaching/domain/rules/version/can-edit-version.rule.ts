import type { CourseVersion } from '../../entities/versions/course-version.entity';

// A version in review is locked: the reviewer must see exactly what was sent.
export function canEditVersion(version: Pick<CourseVersion, 'status'>): boolean {
  return version.status === 'draft' || version.status === 'changes_requested';
}
