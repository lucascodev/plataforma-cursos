export function readCourseRows(body: unknown): unknown[] {
  if (!Array.isArray(body)) return [];
  return body.flatMap((row) => (row && typeof row === 'object' && 'content' in row ? [(row as { content: unknown }).content] : []));
}
