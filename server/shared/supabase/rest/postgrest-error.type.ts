export interface PostgrestError {
  readonly code: string | null;
  readonly hint: string | null;
}
