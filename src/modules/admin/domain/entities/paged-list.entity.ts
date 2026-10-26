export interface PagedList<T> {
  readonly items: readonly T[];
  readonly total: number;
}
