import type { RouteObject } from 'react-router';

export const legalRoutes: RouteObject[] = [
  {
    path: 'privacidade',
    lazy: async () => ({ Component: (await import('../pages/privacy-page/privacy-page')).PrivacyPage }),
  },
];
