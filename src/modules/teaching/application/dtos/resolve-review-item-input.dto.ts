export interface ResolveReviewItemInputDto {
  readonly slug: string;
  readonly versionId: string;
  readonly itemId: string;
  readonly resolved: boolean;
}
