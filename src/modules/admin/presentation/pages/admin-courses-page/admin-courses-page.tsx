import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { CourseRow } from '../../components/course-row/course-row';
import { useAdminCoursesQuery } from '../../hooks/use-admin-courses-query/use-admin-courses-query';
import styles from '../../styles/admin-page.module.css';

export function AdminCoursesPage() {
  const courses = useAdminCoursesQuery();

  return (
    <>
      <title>Cursos</title>
      <h1 className={styles.title}>Cursos</h1>
      <p className={styles.lead}>
        Um curso com estudantes não é apagado: tire do catálogo e ele continua abrindo para quem já estuda. Versões enviadas pelo editor
        aparecem aqui para revisar e publicar.
      </p>
      {courses.isPending ? (
        <PageStatus title="Carregando cursos…" />
      ) : courses.isError ? (
        <PageStatus title="Não foi possível carregar os cursos" />
      ) : courses.data.length === 0 ? (
        <p className={styles.muted}>Nenhum curso ainda.</p>
      ) : (
        <ul className={styles.list}>
          {courses.data.map((course) => (
            <CourseRow key={course.slug} course={course} />
          ))}
        </ul>
      )}
    </>
  );
}
