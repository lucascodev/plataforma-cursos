import { createBrowserRouter } from 'react-router';
import { adminRoutes } from '@/modules/admin';
import { authRoutes } from '@/modules/auth';
import { coursesRoutes, notFoundRoute } from '@/modules/courses';
import { homeRoutes } from '@/modules/home';
import { legalRoutes } from '@/modules/legal';
import { profilesRoutes } from '@/modules/profiles';
import { proposalsRoutes } from '@/modules/proposals';
import { teachingRoutes } from '@/modules/teaching';
import { RootLayout } from '../layouts/root-layout/root-layout';
import { RouteErrorPage } from '../pages/route-error-page/route-error-page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    children: [...homeRoutes, ...coursesRoutes, ...authRoutes, ...profilesRoutes, ...proposalsRoutes, ...teachingRoutes, ...adminRoutes, ...legalRoutes, notFoundRoute],
  },
]);
