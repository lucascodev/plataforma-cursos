const COURSE_SLUG = /^[a-z0-9-]{1,60}$/;

export function isCourseSlug(value: string): boolean {
  return COURSE_SLUG.test(value);
}
