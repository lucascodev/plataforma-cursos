import type { CourseProgressRecord } from '../../../contracts/progress/course-progress.schema';

// The database keeps every field the client did not send, so a tab running older code cannot wipe fields it does not
// know about. Defaults filled in by the schema must not count as sent.
export function sentProgressFields(progress: CourseProgressRecord, raw: unknown): Partial<CourseProgressRecord> {
  const sent = raw !== null && typeof raw === 'object' && 'progress' in raw ? (raw as { progress: unknown }).progress : null;
  if (sent === null || typeof sent !== 'object') return progress;
  return Object.fromEntries(Object.entries(progress).filter(([key]) => key in sent)) as Partial<CourseProgressRecord>;
}
