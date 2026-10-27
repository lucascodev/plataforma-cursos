export const teachingQueryKeys = {
  all: ['teaching'] as const,
  courses: () => ['teaching', 'courses'] as const,
  workspace: (slug: string) => ['teaching', 'workspace', slug] as const,
  stats: (slug: string) => ['teaching', 'stats', slug] as const,
};
