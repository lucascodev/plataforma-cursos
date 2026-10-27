export const adminQueryKeys = {
  all: ['admin'] as const,
  overview: () => ['admin', 'overview'] as const,
  proposals: (status: string | null, page: number) => ['admin', 'proposals', status ?? 'all', page] as const,
  proposal: (id: string) => ['admin', 'proposal', id] as const,
  courses: () => ['admin', 'courses'] as const,
  people: (query: string, role: string | null, page: number) => ['admin', 'people', query, role ?? 'all', page] as const,
  audit: (before: number | null) => ['admin', 'audit', before ?? 'latest'] as const,
  version: (id: string) => ['admin', 'version', id] as const,
  courseVersions: (slug: string) => ['admin', 'course-versions', slug] as const,
};
