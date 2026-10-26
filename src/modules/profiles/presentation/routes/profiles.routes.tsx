import type { RouteObject } from 'react-router';

export const profilesRoutes: RouteObject[] = [
  {
    path: 'perfil',
    lazy: async () => ({ Component: (await import('../pages/my-profile-layout/my-profile-layout')).MyProfileLayout }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import('../pages/profile-tab-page/profile-tab-page')).ProfileTabPage }) },
      { path: 'estudos', lazy: async () => ({ Component: (await import('../pages/studies-tab-page/studies-tab-page')).StudiesTabPage }) },
      { path: 'conta', lazy: async () => ({ Component: (await import('../pages/account-tab-page/account-tab-page')).AccountTabPage }) },
    ],
  },
  {
    path: 'professores/:handle',
    lazy: async () => ({ Component: (await import('../pages/teacher-profile-page/teacher-profile-page')).TeacherProfilePage }),
  },
];
