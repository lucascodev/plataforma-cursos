import { Link } from 'react-router';
import { ProgressMeter } from '@/shared/presentation/components/feedback/progress-meter/progress-meter';
import type { StudyCourseSummary } from '../../../domain/entities/studies/study-course-summary.entity';
import styles from './study-course-list.module.css';

export function StudyCourseList({ courses }: { courses: readonly StudyCourseSummary[] }) {
  return (
    <ul className={styles.list}>
      {courses.map((course) => (
        <li key={course.slug} className={styles.item}>
          <div className={styles.top}>
            <Link className={styles.title} to={`/cursos/${course.slug}`}>
              {course.title}
            </Link>
            <span className={styles.percent}>{course.percent}%</span>
          </div>
          <ProgressMeter value={course.percent} max={100} label={`Progresso em ${course.title}`} />
          <p className={styles.meta}>
            {course.totalItems > 0 ? `${course.completedItems} de ${course.totalItems} itens` : `${course.completedItems} itens`} ·{' '}
            {course.projectsDone === 1 ? '1 projeto' : `${course.projectsDone} projetos`} ·{' '}
            {course.studyDays === 1 ? '1 dia de estudo' : `${course.studyDays} dias de estudo`}
          </p>
        </li>
      ))}
    </ul>
  );
}
