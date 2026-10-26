import { Link, useParams } from 'react-router';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { CourseNotFoundError } from '../../../domain/errors/course-not-found.error';
import { CourseDetails } from '../../components/course-details/course-details';
import { useCourseDetailsQuery } from '../../hooks/use-course-details-query/use-course-details-query';

export function CoursePage() {
  const { slug = '' } = useParams();
  const details = useCourseDetailsQuery(slug);

  if (details.isPending) return <PageStatus title="Carregando curso…" />;
  if (details.isError) {
    return (
      <PageStatus title={details.error instanceof CourseNotFoundError ? 'Curso não encontrado' : 'Não foi possível abrir o curso'}>
        <p>
          <Link to="/cursos">Ver todos os cursos</Link>
        </p>
      </PageStatus>
    );
  }

  return <CourseDetails key={slug} details={details.data} />;
}
