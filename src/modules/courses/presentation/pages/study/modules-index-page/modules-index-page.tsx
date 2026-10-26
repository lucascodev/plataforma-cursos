import { Navigate } from 'react-router';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';

export function ModulesIndexPage() {
  const { details, study } = useStudyContext();
  const moduleId = study.currentModuleId ?? details.course.modules[0]?.id ?? '';
  return <Navigate to={`/cursos/${details.course.slug}/modulos/${moduleId}`} replace />;
}
