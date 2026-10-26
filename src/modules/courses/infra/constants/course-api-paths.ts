export const COURSE_API_PATHS = {
  list: '/api/courses',
  detail: (slug: string) => `/api/courses/${encodeURIComponent(slug)}`,
} as const;
