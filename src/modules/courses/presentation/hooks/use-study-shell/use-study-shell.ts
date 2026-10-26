import { useCourseProgress } from '@/modules/progress';
import type { CourseDetailsOutputDto } from '../../../application/dtos/get-course-by-slug/course-details-output.dto';
import type { StudyNavLink } from '../../types/study/study-nav-link.type';
import { useCourseDashboard } from '../use-course-dashboard/use-course-dashboard';

// Progress and plan for the signed-in person, plus the course navigation built from them.
export function useStudyShell(details: CourseDetailsOutputDto) {
  const progressState = useCourseProgress(details.course.slug);
  const study = useCourseDashboard(details, progressState);
  const base = `/cursos/${details.course.slug}`;

  const navLinks: StudyNavLink[] = [
    { to: `${base}/hoje`, label: 'Hoje', icon: 'today', showOnMobile: true },
    { to: `${base}/plano`, label: 'Plano', icon: 'plan', showOnMobile: true },
    { to: `${base}/modulos`, label: 'Módulos', icon: 'modules', showOnMobile: true },
    { to: `${base}/projetos`, label: 'Projetos', icon: 'projects', showOnMobile: false },
    { to: `${base}/diario`, label: 'Diário', icon: 'journal', showOnMobile: true },
    { to: `${base}/dados`, label: 'Seus dados', icon: 'data', showOnMobile: false },
  ];

  return {
    progressState,
    study,
    navLinks,
    needsStart: progressState.status === 'ready' && progressState.progress?.startDate === null,
    startPath: `${base}/comecar`,
  };
}
