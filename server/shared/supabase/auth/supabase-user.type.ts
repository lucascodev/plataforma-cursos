export interface SupabaseUser {
  readonly id: string;
  readonly user_metadata?: Record<string, unknown>;
}
