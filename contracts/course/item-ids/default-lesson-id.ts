// Lessons written before ids existed are identified by position. The same rule lives in the course_item_ids migration.
export function defaultLessonId(lessonIndex: number): string {
  return `t${lessonIndex}`;
}
