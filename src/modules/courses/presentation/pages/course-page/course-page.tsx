import { Link, useParams } from 'react-router';
import { useAuthSession } from '@/modules/auth';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { CourseNotFoundError } from '../../../domain/errors/course-not-found.error';
import { CourseDashboard } from '../../components/course-dashboard/course-dashboard';
import { CoursePreview } from '../../components/course-preview/course-preview';
import { useCourseDetailsQuery } from '../../hooks/use-course-details-query/use-course-details-query';

export function CoursePage() {
  const { slug = '' } = useParams();
  const details = useCourseDetailsQuery(slug);
  const session = useAuthSession();

  if (details.isPending) return <PageStatus title="Carregando curso…" />;
  if (details.isError) {
    return (
      <PageStatus title={details.error instanceof CourseNotFoundError ? 'Curso não encontrado' : 'Não foi possível abrir o curso'}>
        <p>
          <Link to="/">Ver todos os cursos</Link>
        </p>
      </PageStatus>
    );
  }

  if (!session.user) {
    return (
      <CoursePreview details={details.data} isCheckingSession={session.status === 'loading'} onSignIn={() => session.signIn(`/cursos/${slug}`)} />
    );
  }

  return <CourseDashboard key={`${slug}:${session.user.id}`} details={details.data} />;
}
