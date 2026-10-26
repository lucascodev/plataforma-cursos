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
      {
        path: 'cursos/:slug/plano',
        lazy: async () => ({ Component: (await import('../pages/study/plan-page/plan-page')).PlanPage }),
      },
      {
        path: 'cursos/:slug/modulos',
        lazy: async () => ({ Component: (await import('../pages/study/modules-index-page/modules-index-page')).ModulesIndexPage }),
      },
      {
        path: 'cursos/:slug/modulos/:moduleId',
        lazy: async () => ({ Component: (await import('../pages/study/module-page/module-page')).ModulePage }),
      },
      {
        path: 'cursos/:slug/projetos',
        lazy: async () => ({ Component: (await import('../pages/study/projects-index-page/projects-index-page')).ProjectsIndexPage }),
      },
      {
        path: 'cursos/:slug/projetos/:moduleId',
        lazy: async () => ({ Component: (await import('../pages/study/project-page/project-page')).ProjectPage }),
      },
      {
        path: 'cursos/:slug/diario',
        lazy: async () => ({ Component: (await import('../pages/study/journal-page/journal-page')).JournalPage }),
      },
    ],
  },
];
