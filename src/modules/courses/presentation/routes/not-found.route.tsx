import type { RouteObject } from 'react-router';

export const notFoundRoute: RouteObject = {
  path: '*',
  lazy: async () => ({ Component: (await import('../pages/not-found-page/not-found-page')).NotFoundPage }),
};
