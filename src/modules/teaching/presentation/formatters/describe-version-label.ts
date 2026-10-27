import type { CourseVersion } from '../../domain/entities/versions/course-version.entity';

export function describeVersionLabel(version: Pick<CourseVersion, 'semver'>, publishedSemver: string | null): string {
  if (version.semver) return `v${version.semver}`;
  return publishedSemver ? `a partir da v${publishedSemver}` : 'primeira versão';
}
