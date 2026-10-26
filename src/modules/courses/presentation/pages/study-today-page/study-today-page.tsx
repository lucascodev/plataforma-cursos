import { Link, Navigate, useParams } from 'react-router';
import { useAuthSession } from '@/modules/auth';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { CourseNotFoundError } from '../../../domain/errors/course-not-found.error';
import { CourseDashboard } from '../../components/course-dashboard/course-dashboard';
import { useCourseDetailsQuery } from '../../hooks/use-course-details-query/use-course-details-query';

export function StudyTodayPage() {
  const { slug = '' } = useParams();
  const details = useCourseDetailsQuery(slug);
  const session = useAuthSession();

  if (session.status === 'signed-out') return <Navigate to={`/entrar?voltar=${encodeURIComponent(`/cursos/${slug}/hoje`)}`} replace />;
  if (details.isPending || session.status === 'loading') return <PageStatus title="Carregando curso…" />;
  if (details.isError) {
    return (
      <PageStatus title={details.error instanceof CourseNotFoundError ? 'Curso não encontrado' : 'Não foi possível abrir o curso'}>
        <p>
          <Link to="/cursos">Ver todos os cursos</Link>
        </p>
      </PageStatus>
    );
  }
  return <CourseDashboard key={`${slug}:${session.user?.id ?? ''}`} details={details.data} />;
}
