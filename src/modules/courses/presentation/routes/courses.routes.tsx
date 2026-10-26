import type { RouteObject } from 'react-router';

export const coursesRoutes: RouteObject[] = [
  {
    path: 'cursos',
    lazy: async () => ({ Component: (await import('../pages/catalog-page/catalog-page')).CatalogPage }),
  },
  {
    path: 'cursos/:slug',
    lazy: async () => ({ Component: (await import('../pages/course-page/course-page')).CoursePage }),
  },
  {
    path: 'cursos/:slug/hoje',
    lazy: async () => ({ Component: (await import('../pages/study-today-page/study-today-page')).StudyTodayPage }),
  },
];
