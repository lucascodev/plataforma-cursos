export const courseQueryKeys = {
  all: ['courses'] as const,
  catalog: () => ['courses', 'catalog'] as const,
  detail: (slug: string) => ['courses', 'detail', slug] as const,
};
