import { Link } from 'react-router';
import { SectionHeading } from '@/shared/presentation/components/layout/section-heading/section-heading';
import { StudyCourseList } from '../../components/study-course-list/study-course-list';
import { StudyStats } from '../../components/study-stats/study-stats';
import { useMyStudies } from '../../hooks/use-my-studies/use-my-studies';
import styles from './studies-tab-page.module.css';

export function StudiesTabPage() {
  const studies = useMyStudies();
  if (studies.status === 'loading') return <p className={styles.status}>Carregando seus estudos…</p>;
  if (studies.status === 'error') return <p className={styles.status}>Não foi possível carregar seus estudos agora.</p>;
  const { summary } = studies;

  return (
    <div className={styles.tab}>
      <StudyStats summary={summary} />
      <section className={styles.section} aria-labelledby="perfil-cursos">
        <SectionHeading id="perfil-cursos" title="Seus cursos" />
        {summary.courses.length === 0 ? (
          <p className={styles.status}>
            Você ainda não começou nenhum curso. <Link to="/cursos">Ver cursos</Link>
          </p>
        ) : (
          <StudyCourseList courses={summary.courses} />
        )}
      </section>
      <p className={styles.note}>Notas e diário ficam só com você e não aparecem aqui nem para professores.</p>
    </div>
  );
}
