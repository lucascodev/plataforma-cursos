export class SupabaseRequestError extends Error {
  constructor(
    readonly status: number,
    readonly operation: string,
  ) {
    super(`Supabase ${operation} failed with status ${status}`);
    this.name = 'SupabaseRequestError';
  }
}
