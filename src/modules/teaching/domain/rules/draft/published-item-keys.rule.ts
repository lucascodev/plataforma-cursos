import { normalizeCourseDraft } from './normalize-course-draft.rule';

// Progress keys of the lessons and drills students can already mark as done. Removing one of them drops that mark.
export function publishedItemKeys(publishedContent: unknown): ReadonlySet<string> {
  if (!publishedContent) return new Set();
  const published = normalizeCourseDraft(publishedContent, '');
  return new Set(
    published.modules.flatMap((module) => [
      ...module.lessons.map((lesson) => `${module.id}-${lesson.id}`),
      ...module.drills.map((drill) => `${module.id}-${drill.id}`),
    ]),
  );
}
