import { courseAuthorSchema, type CourseAuthorRecord } from '../../../contracts/course-author.schema';

// The owner embed comes back as { handle, display_name, avatar_url } or null when the course has no owner.
export function readCourseAuthor(row: unknown): CourseAuthorRecord | null {
  if (!row || typeof row !== 'object' || !('owner' in row)) return null;
  const owner = (row as { owner: unknown }).owner;
  if (!owner || typeof owner !== 'object') return null;
  const record = owner as Record<string, unknown>;
  const parsed = courseAuthorSchema.safeParse({ handle: record.handle, displayName: record.display_name, avatarUrl: record.avatar_url ?? null });
  return parsed.success ? parsed.data : null;
}
