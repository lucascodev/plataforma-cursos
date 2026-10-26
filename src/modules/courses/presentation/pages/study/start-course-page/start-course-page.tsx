import { Link, Navigate, useLocation, useParams } from 'react-router';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { useStudySession } from '../../../hooks/use-study-session/use-study-session';
import { StartCourseForm } from './components/start-course-form/start-course-form';

export function StartCoursePage() {
  const { slug = '' } = useParams();
  const location = useLocation();
  const session = useStudySession(slug);

  if (session.status === 'signed-out') return <Navigate to={`/entrar?voltar=${encodeURIComponent(location.pathname)}`} replace />;
  if (session.status === 'loading') return <PageStatus title="Carregando curso…" />;
  if (session.status !== 'ready') {
    return (
      <PageStatus title={session.status === 'not-found' ? 'Curso não encontrado' : 'Não foi possível abrir o curso'}>
        <p>
          <Link to="/cursos">Ver todos os cursos</Link>
        </p>
      </PageStatus>
    );
  }
  return <StartCourseForm key={slug} details={session.details} />;
}
