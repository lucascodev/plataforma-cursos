export interface ResolvedSession {
  readonly accessToken: string;
  readonly userId: string;
  readonly cookies: readonly string[];
}
