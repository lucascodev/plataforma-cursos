import type { RouteObject } from 'react-router';

export const coursesRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => ({ Component: (await import('../pages/catalog-page/catalog-page')).CatalogPage }),
  },
  {
    path: 'cursos/:slug',
    lazy: async () => ({ Component: (await import('../pages/course-page/course-page')).CoursePage }),
  },
];
