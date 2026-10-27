const segment = (value: string) => encodeURIComponent(value);

export const ADMIN_API_PATHS = {
  overview: '/api/admin/overview',
  proposals: '/api/admin/proposals',
  proposal: (id: string) => `/api/admin/proposals/${segment(id)}`,
  approve: (id: string) => `/api/admin/proposals/${segment(id)}/approve`,
  requestChanges: (id: string) => `/api/admin/proposals/${segment(id)}/request-changes`,
  refuse: (id: string) => `/api/admin/proposals/${segment(id)}/refuse`,
  courses: '/api/admin/courses',
  course: (slug: string) => `/api/admin/courses/${segment(slug)}`,
  courseListing: (slug: string) => `/api/admin/courses/${segment(slug)}/listing`,
  courseOwner: (slug: string) => `/api/admin/courses/${segment(slug)}/owner`,
  people: '/api/admin/people',
  personRole: (id: string) => `/api/admin/people/${segment(id)}/role`,
  audit: '/api/admin/audit',
  courseVersions: (slug: string) => `/api/admin/courses/${segment(slug)}/versions`,
  version: (id: string) => `/api/admin/versions/${segment(id)}`,
  publishVersion: (id: string) => `/api/admin/versions/${segment(id)}/publish`,
  requestVersionChanges: (id: string) => `/api/admin/versions/${segment(id)}/request-changes`,
  restoreVersion: (id: string) => `/api/admin/versions/${segment(id)}/restore`,
} as const;
