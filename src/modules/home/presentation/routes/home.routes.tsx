import type { RouteObject } from 'react-router';

export const homeRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => ({ Component: (await import('../pages/home-page/home-page')).HomePage }),
  },
];
