export interface RequestVersionChangesInputDto {
  readonly id: string;
  readonly revision: number;
  /** One point per line. */
  readonly text: string;
}
