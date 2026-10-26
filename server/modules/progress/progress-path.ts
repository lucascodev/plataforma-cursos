export function progressPath(slug: string, userId: string): string {
  return `course_progress?course_slug=eq.${slug}&user_id=eq.${encodeURIComponent(userId)}`;
}
