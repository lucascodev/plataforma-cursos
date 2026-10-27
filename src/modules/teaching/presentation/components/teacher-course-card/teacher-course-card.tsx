import { Link } from 'react-router';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import type { TeacherCourse } from '../../../domain/entities/teacher-course.entity';
import { describeCourseAction } from '../../formatters/describe-course-action';
import { describeVersionStatus } from '../../formatters/describe-version-status';
import { formatShortDate } from '../../formatters/format-short-date';
import { CourseStatsPanel } from '../course-stats-panel/course-stats-panel';
import styles from './teacher-course-card.module.css';

export function TeacherCourseCard({ course }: { readonly course: TeacherCourse }) {
  const { publishedVersion, openVersion } = course;
  const openStatus = openVersion ? describeVersionStatus(openVersion.status) : null;

  return (
    <article className={styles.card} aria-labelledby={`curso-${course.slug}`}>
      <div className={styles.head}>
        <div className={styles.heading}>
          <p className={styles.badges}>
            {publishedVersion ? <Badge tone="accent">Publicado · v{publishedVersion.semver}</Badge> : <Badge>Nunca publicado</Badge>}
            {openVersion && openStatus ? (
              <Badge tone={openStatus.tone}>
                {openVersion.semver ? `v${openVersion.semver} · ` : ''}
                {openStatus.label.toLowerCase()}
              </Badge>
            ) : null}
            {course.published && !course.listed ? <Badge tone="warning">Fora do catálogo</Badge> : null}
          </p>
          <h2 id={`curso-${course.slug}`} className={styles.title}>
            {course.title || course.slug}
          </h2>
          <p className={styles.meta}>
            {publishedVersion?.publishedAt ? `Publicado em ${formatShortDate(publishedVersion.publishedAt)} · ` : ''}
            {openVersion ? `rascunho editado em ${formatShortDate(openVersion.updatedAt)}` : 'nenhuma versão aberta'}
            {course.published ? '' : '. Só você e a equipe veem este curso.'}
          </p>
        </div>
        <div className={styles.actions}>
          {course.published ? (
            <Link className={styles.secondary} to={`/cursos/${course.slug}`}>
              Ver no site
            </Link>
          ) : null}
          <Link className={styles.primary} to={`/professor/cursos/${course.slug}/editar`}>
            {describeCourseAction(course)}
          </Link>
        </div>
      </div>
      {course.published ? (
        <div className={styles.body}>
          <CourseStatsPanel slug={course.slug} />
        </div>
      ) : null}
    </article>
  );
}
