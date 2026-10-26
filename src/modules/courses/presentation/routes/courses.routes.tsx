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
    path: 'cursos/:slug/comecar',
    lazy: async () => ({ Component: (await import('../pages/study/start-course-page/start-course-page')).StartCoursePage }),
  },
  {
    lazy: async () => ({ Component: (await import('../layouts/course-study-layout/course-study-layout')).CourseStudyLayout }),
    children: [
      {
        path: 'cursos/:slug/hoje',
        lazy: async () => ({ Component: (await import('../pages/study/today-page/today-page')).TodayPage }),
      },
    ],
  },
];
