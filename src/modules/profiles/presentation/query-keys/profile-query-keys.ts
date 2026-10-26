export const profileQueryKeys = {
  all: ['profiles'] as const,
  mine: (userId: string) => ['profiles', 'mine', userId] as const,
  settings: (userId: string) => ['profiles', 'settings', userId] as const,
  teacher: (handle: string) => ['profiles', 'teacher', handle] as const,
};
