export function progressApiPath(courseSlug: string): string {
  return `/api/progress/${encodeURIComponent(courseSlug)}`;
}
