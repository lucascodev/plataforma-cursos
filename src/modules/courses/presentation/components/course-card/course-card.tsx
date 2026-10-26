import { Link } from 'react-router';
import { formatDayMonthYear } from '@/shared/utils/date/format/format-day-month-year';
import { pluralize } from '@/shared/utils/text/pluralize';
import type { CourseSummaryOutputDto } from '../../../application/dtos/list-courses/course-summary-output.dto';
import { deliversProject } from '../../../domain/rules/module/delivers-project.rule';
import { describeDuration } from '../../formatters/describe-duration';
import { lowerFirst } from '../../formatters/lower-first';
import styles from './course-card.module.css';

export function CourseCard({ course }: { readonly course: CourseSummaryOutputDto }) {
  const projectModules = course.modules.filter((module) => deliversProject(module.kind));
  const { totals } = course;

  return (
    <article className={styles.card}>
      <div className={styles.info}>
        <div className={styles.tags}>
          <span className={styles.level}>{course.level}</span>
          <span className={styles.updated}>Atualizado em {formatDayMonthYear(course.updatedAt)}</span>
        </div>
        <h2 className={styles.title}>
          <Link to={`/cursos/${course.slug}`}>{course.title}</Link>
        </h2>
        <p className={styles.tagline}>{course.tagline}</p>
        {course.author ? (
          <Link className={styles.author} to={`/professores/${course.author.handle}`}>
            {course.author.avatarUrl ? <img src={course.author.avatarUrl} alt="" width={32} height={32} referrerPolicy="no-referrer" /> : null}
            <span>
              por <strong>{course.author.displayName}</strong>
            </span>
          </Link>
        ) : null}
        <p className={styles.audience}>Para {lowerFirst(course.audience)}</p>
        <dl className={styles.stats}>
          <div>
            <dt>Módulos</dt>
            <dd>{totals.modules}</dd>
          </div>
          <div>
            <dt>Aulas</dt>
            <dd>{totals.lessons}</dd>
          </div>
          <div>
            <dt>Projetos</dt>
            <dd>{totals.hasCapstone ? `${totals.projects} + 1` : totals.projects}</dd>
          </div>
          <div>
            <dt>Duração</dt>
            <dd>{describeDuration(totals.months)}</dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <Link className={styles.primary} to={`/cursos/${course.slug}`}>
            Ver detalhes
          </Link>
          <Link className={styles.secondary} to={`/cursos/${course.slug}/comecar`}>
            Começar hoje
          </Link>
        </div>
      </div>
      <div className={styles.projects}>
        <p className={styles.projectsTitle}>{pluralize(projectModules.length, 'projeto que você vai entregar', 'projetos que você vai entregar')}</p>
        <ol className={styles.projectList}>
          {projectModules.map((module) => (
            <li key={module.id} className={module.kind === 'capstone' ? styles.capstone : undefined}>
              <span className={styles.code}>{module.code}</span>
              <span>
                {module.projectTitle}
                {module.kind === 'capstone' ? ' (conclusão)' : ''}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}
