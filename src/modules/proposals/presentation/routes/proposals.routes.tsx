import type { RouteObject } from 'react-router';

export const proposalsRoutes: RouteObject[] = [
  {
    path: 'propor-curso',
    lazy: async () => ({ Component: (await import('../pages/propose-course-page/propose-course-page')).ProposeCoursePage }),
  },
  {
    path: 'minhas-propostas',
    lazy: async () => ({ Component: (await import('../pages/my-proposals-page/my-proposals-page')).MyProposalsPage }),
  },
  {
    path: 'minhas-propostas/:id',
    lazy: async () => ({ Component: (await import('../pages/proposal-detail-page/proposal-detail-page')).ProposalDetailPage }),
  },
];
