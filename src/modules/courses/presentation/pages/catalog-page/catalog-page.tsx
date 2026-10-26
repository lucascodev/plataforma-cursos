import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { CourseCard } from '../../components/course-card/course-card';
import { describeCourseFacts } from '../../formatters/describe-course-facts';
import { useCourseCatalogQuery } from '../../hooks/use-course-catalog-query/use-course-catalog-query';
import styles from './catalog-page.module.css';

export function CatalogPage() {
  const catalog = useCourseCatalogQuery();

  if (catalog.isPending) return <PageStatus title="Carregando cursos…" />;
  if (catalog.isError) return <PageStatus title="Não foi possível carregar os cursos" />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cursos</h1>
        <p className={styles.lead}>
          Cada curso tem plano diário, exercícios antes de cada projeto e um projeto prático por módulo. Entre com o GitHub para
          começar: o progresso fica salvo na sua conta e aparece em qualquer aparelho.
        </p>
      </header>
      {catalog.data.length === 0 ? (
        <p>Nenhum curso publicado ainda.</p>
      ) : (
        <div className={styles.grid}>
          {catalog.data.map((course) => (
            <CourseCard
              key={course.slug}
              slug={course.slug}
              title={course.title}
              tagline={course.tagline}
              level={course.level}
              audience={course.audience}
              facts={describeCourseFacts(course.totals).slice(0, 4)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
