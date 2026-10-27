import type { CourseVersionKind } from './course-version-kind.schema.ts';

// Same rule as private.next_semver in the database: the first publication is 1.0.0.
export function nextSemver(current: string | null, kind: CourseVersionKind): string {
  if (current === null || kind === 'first') return '1.0.0';
  const [major = 0, minor = 0, patch = 0] = current.split('.').map(Number);
  if (kind === 'major') return `${major + 1}.0.0`;
  if (kind === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}
