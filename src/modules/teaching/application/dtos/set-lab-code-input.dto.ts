export interface SetLabCodeInputDto {
  readonly slug: string;
  readonly itemKey: string;
  /** Empty removes the code. */
  readonly code: string;
}
