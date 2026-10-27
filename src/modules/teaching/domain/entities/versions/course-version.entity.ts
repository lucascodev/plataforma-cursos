import type { VersionKind } from '../../types/version-kind.type';
import type { VersionStatus } from '../../types/version-status.type';
import type { ReviewItem } from './review-item.entity';

export interface CourseVersion {
  readonly id: string;
  readonly courseSlug: string;
  readonly status: VersionStatus;
  readonly semver: string | null;
  readonly kind: VersionKind | null;
  readonly revision: number;
  readonly submitMessage: string | null;
  readonly reviewItems: readonly ReviewItem[];
  readonly releaseNote: string | null;
  readonly basedOnSemver: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly submittedAt: string | null;
  readonly reviewedAt: string | null;
  readonly publishedAt: string | null;
}
