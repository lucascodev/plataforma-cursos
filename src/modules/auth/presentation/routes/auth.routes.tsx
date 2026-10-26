import type { RouteObject } from 'react-router';

export const authRoutes: RouteObject[] = [
  {
    path: 'entrar',
    lazy: async () => ({ Component: (await import('../pages/sign-in-page/sign-in-page')).SignInPage }),
  },
];
