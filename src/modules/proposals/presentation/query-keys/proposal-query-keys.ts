export const proposalQueryKeys = {
  all: ['proposals'] as const,
  mine: (userId: string) => ['proposals', 'mine', userId] as const,
  detail: (id: string) => ['proposals', 'detail', id] as const,
};
