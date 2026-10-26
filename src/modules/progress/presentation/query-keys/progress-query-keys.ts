export const progressQueryKeys = {
  all: ['progress'] as const,
  byCourse: (courseSlug: string, userId: string) => ['progress', courseSlug, userId] as const,
  summaries: (userId: string) => ['progress', 'summaries', userId] as const,
};
