import type { SubmittableVersionKind } from '../../domain/types/version-kind.type';

export interface SubmitVersionInputDto {
  readonly slug: string;
  readonly versionId: string;
  readonly revision: number;
  readonly kind: SubmittableVersionKind;
  readonly message: string;
}
