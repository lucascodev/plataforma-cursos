export const PROFILE_API_PATHS = {
  myProfile: '/api/me/profile',
  settings: '/api/me/settings',
  teacher: (handle: string) => `/api/teachers/${encodeURIComponent(handle)}`,
} as const;
