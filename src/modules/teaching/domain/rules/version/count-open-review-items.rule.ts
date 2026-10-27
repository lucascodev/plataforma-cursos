import type { CourseVersion } from '../../entities/versions/course-version.entity';

export function countOpenReviewItems(version: Pick<CourseVersion, 'reviewItems'>): number {
  return version.reviewItems.filter((item) => !item.resolved).length;
}
