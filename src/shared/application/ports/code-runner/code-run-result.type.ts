export interface CodeRunResult {
  readonly results: readonly { readonly id: string; readonly passed: boolean; readonly message: string }[];
  /** Set when the code could not run at all (syntax error, timeout, runtime failed to load). */
  readonly error: string | null;
  readonly output: string;
}
