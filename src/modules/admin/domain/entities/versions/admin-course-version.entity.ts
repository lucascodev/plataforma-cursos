export interface AdminCourseVersion {
  readonly id: string;
  readonly courseSlug: string;
  readonly status: 'draft' | 'in_review' | 'changes_requested' | 'published' | 'superseded';
  readonly semver: string | null;
  readonly kind: 'first' | 'patch' | 'minor' | 'major' | null;
  readonly revision: number;
  readonly submitMessage: string | null;
  readonly reviewItems: readonly { readonly id: string; readonly text: string; readonly resolved: boolean }[];
  readonly releaseNote: string | null;
  readonly basedOnSemver: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly submittedAt: string | null;
  readonly reviewedAt: string | null;
  readonly publishedAt: string | null;
}
