import { Navigate } from 'react-router';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import { useProjectsIndex } from '../../../hooks/use-projects-index/use-projects-index';

export function ProjectsIndexPage() {
  return <Navigate to={useProjectsIndex(useStudyContext())} replace />;
}
