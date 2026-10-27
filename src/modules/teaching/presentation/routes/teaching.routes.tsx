import type { RouteObject } from 'react-router';

export const teachingRoutes: RouteObject[] = [
  {
    path: 'professor',
    lazy: async () => ({ Component: (await import('../pages/teacher-dashboard-page/teacher-dashboard-page')).TeacherDashboardPage }),
  },
  {
    path: 'professor/cursos/:slug/editar',
    lazy: async () => ({ Component: (await import('../pages/course-editor-page/course-editor-page')).CourseEditorPage }),
  },
];
