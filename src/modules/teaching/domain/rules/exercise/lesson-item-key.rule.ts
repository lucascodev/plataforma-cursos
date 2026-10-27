// The same key progress and lab codes use for a lesson.
export function lessonItemKey(moduleId: string, lessonId: string): string {
  return `${moduleId}-${lessonId}`;
}
