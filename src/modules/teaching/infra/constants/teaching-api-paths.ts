const segment = (value: string) => encodeURIComponent(value);
const course = (slug: string) => `/api/teaching/courses/${segment(slug)}`;

export const TEACHING_API_PATHS = {
  courses: '/api/teaching/courses',
  course,
  stats: (slug: string) => `${course(slug)}/stats`,
  draft: (slug: string) => `${course(slug)}/draft`,
  submit: (slug: string) => `${course(slug)}/submit`,
  withdraw: (slug: string) => `${course(slug)}/withdraw`,
  reviewItem: (slug: string, itemId: string) => `${course(slug)}/review-items/${segment(itemId)}`,
} as const;
