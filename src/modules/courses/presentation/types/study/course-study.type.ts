import type { useCourseDashboard } from '../../hooks/use-course-dashboard/use-course-dashboard';

export type CourseStudy = NonNullable<ReturnType<typeof useCourseDashboard>>;
