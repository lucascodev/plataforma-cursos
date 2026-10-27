import type { RouteObject } from 'react-router';

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    lazy: async () => ({ Component: (await import('../pages/admin-layout/admin-layout')).AdminLayout }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import('../pages/admin-overview-page/admin-overview-page')).AdminOverviewPage }) },
      { path: 'propostas', lazy: async () => ({ Component: (await import('../pages/admin-proposals-page/admin-proposals-page')).AdminProposalsPage }) },
      { path: 'propostas/:id', lazy: async () => ({ Component: (await import('../pages/admin-proposal-page/admin-proposal-page')).AdminProposalPage }) },
      { path: 'cursos', lazy: async () => ({ Component: (await import('../pages/admin-courses-page/admin-courses-page')).AdminCoursesPage }) },
      { path: 'versoes/:id', lazy: async () => ({ Component: (await import('../pages/admin-version-page/admin-version-page')).AdminVersionPage }) },
      { path: 'pessoas', lazy: async () => ({ Component: (await import('../pages/admin-people-page/admin-people-page')).AdminPeoplePage }) },
      { path: 'avisos', lazy: async () => ({ Component: (await import('../pages/admin-reports-page/admin-reports-page')).AdminReportsPage }) },
      { path: 'historico', lazy: async () => ({ Component: (await import('../pages/admin-history-page/admin-history-page')).AdminHistoryPage }) },
    ],
  },
];
