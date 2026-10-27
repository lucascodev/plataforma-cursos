const segment = (value: string) => encodeURIComponent(value);

export const COURSE_API_PATHS = {
  list: '/api/courses',
  detail: (slug: string) => `/api/courses/${segment(slug)}`,
  verifyLab: (slug: string, itemKey: string) => `/api/courses/${segment(slug)}/labs/${segment(itemKey)}/verify`,
} as const;
