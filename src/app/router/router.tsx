import { createBrowserRouter } from 'react-router';
import { authRoutes } from '@/modules/auth';
import { coursesRoutes, notFoundRoute } from '@/modules/courses';
import { legalRoutes } from '@/modules/legal';
import { RootLayout } from '../layouts/root-layout/root-layout';
import { RouteErrorPage } from '../pages/route-error-page/route-error-page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    children: [...coursesRoutes, ...authRoutes, ...legalRoutes, notFoundRoute],
  },
]);
