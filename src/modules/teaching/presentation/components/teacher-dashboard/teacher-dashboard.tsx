import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import { useAuthSession } from '@/modules/auth';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { EmptyState } from '@/shared/presentation/components/feedback/empty-state/empty-state';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { Skeleton } from '@/shared/presentation/components/feedback/skeleton/skeleton';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useTeacherCoursesQuery } from '../../hooks/use-teacher-courses-query/use-teacher-courses-query';
import { TeacherCourseCard } from '../teacher-course-card/teacher-course-card';
import styles from './teacher-dashboard.module.css';

export function TeacherDashboard() {
  const session = useAuthSession();
  const courses = useTeacherCoursesQuery();
  const needsChanges = courses.data?.filter((course) => course.openVersion?.status === 'changes_requested') ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Área do professor</p>
          <h1 className={styles.title}>Meus cursos</h1>
        </div>
        <div className={styles.actions}>
          {session.user ? (
            <Link className={styles.secondary} to={`/professores/${session.user.handle}`}>
              Meu perfil público
            </Link>
          ) : null}
          <Link className={styles.primary} to="/propor-curso">
            <Plus size={18} aria-hidden="true" />
            Propor novo curso
          </Link>
        </div>
      </header>

      {needsChanges.map((course) => (
        <Banner
          key={course.slug}
          tone="warning"
          title={`A revisão de ${course.title} pediu ajustes`}
          action={<Link to={`/professor/cursos/${course.slug}/editar`}>Ver ajustes</Link>}
        >
          {course.published ? 'A versão publicada continua no ar enquanto você ajusta.' : 'Faça os ajustes e envie de novo.'}
        </Banner>
      ))}

      {courses.isPending ? <Skeleton height="180px" radius="md" /> : null}
      {courses.isError ? (
        <PageStatus title="Não foi possível carregar seus cursos">
          <p>{readErrorMessage(courses.error, 'Tente de novo em instantes.')}</p>
          <Button onClick={() => void courses.refetch()}>Tentar de novo</Button>
        </PageStatus>
      ) : null}
      {courses.data?.length === 0 ? (
        <EmptyState title="Você ainda não tem cursos" action={<Link to="/propor-curso">Propor um curso</Link>}>
          Quando uma proposta sua for aprovada, o curso aparece aqui, pronto para escrever no editor.
        </EmptyState>
      ) : null}
      {courses.data?.map((course) => <TeacherCourseCard key={course.slug} course={course} />)}

      <p className={styles.note}>
        Propostas enviadas e respostas da equipe ficam em <Link to="/minhas-propostas">Minhas propostas</Link>.
      </p>
    </div>
  );
}
