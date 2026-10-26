// ?page=N (1-based) becomes an offset. Anything odd falls back to the first page.
export function readPageOffset(url: URL, pageSize: number): number {
  const page = Number(url.searchParams.get('page') ?? '1');
  if (!Number.isInteger(page) || page < 1 || page > 1000) return 0;
  return (page - 1) * pageSize;
}
