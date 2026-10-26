import { Link, useParams } from 'react-router';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { SectionHeading } from '@/shared/presentation/components/layout/section-heading/section-heading';
import { useTeacherProfileQuery } from '../../hooks/use-teacher-profile-query/use-teacher-profile-query';
import styles from './teacher-profile-page.module.css';

export function TeacherProfilePage() {
  const { handle = '' } = useParams();
  const teacher = useTeacherProfileQuery(handle);

  if (teacher.isPending) return <PageStatus title="Carregando perfil…" />;
  if (teacher.isError) return <PageStatus title="Não foi possível carregar o perfil" />;
  if (!teacher.data) {
    return (
      <PageStatus title="Perfil não encontrado">
        <p>
          <Link to="/">Ver os cursos</Link>
        </p>
      </PageStatus>
    );
  }
  const profile = teacher.data;

  return (
    <div className={styles.page}>
      <title>{profile.displayName}</title>
      <header className={styles.header}>
        {profile.avatarUrl ? <img className={styles.avatar} src={profile.avatarUrl} alt="" width={88} height={88} referrerPolicy="no-referrer" /> : null}
        <div className={styles.identity}>
          <p className={styles.kicker}>Professor</p>
          <h1 className={styles.name}>{profile.displayName}</h1>
          {profile.headline ? <p className={styles.headline}>{profile.headline}</p> : null}
          <p className={styles.meta}>
            <span className={styles.handle}>@{profile.handle}</span>
            {profile.studentCount !== null ? (
              <span>{profile.studentCount === 1 ? '1 pessoa estudando' : `${profile.studentCount} pessoas estudando`}</span>
            ) : null}
          </p>
        </div>
      </header>
      {profile.bio ? <p className={styles.bio}>{profile.bio}</p> : null}
      {profile.links.length > 0 ? (
        <ul className={styles.links}>
          {profile.links.map((link) => (
            <li key={link.url}>
              <ExternalLink href={link.url}>{link.label}</ExternalLink>
            </li>
          ))}
        </ul>
      ) : null}
      <section className={styles.section} aria-labelledby="professor-cursos">
        <SectionHeading id="professor-cursos" title="Cursos" />
        {profile.courses.length === 0 ? (
          <p className={styles.empty}>Nenhum curso publicado ainda.</p>
        ) : (
          <ul className={styles.courses}>
            {profile.courses.map((course) => (
              <li key={course.slug} className={styles.course}>
                <Link className={styles.courseTitle} to={`/cursos/${course.slug}`}>
                  {course.title}
                </Link>
                {course.tagline ? <p className={styles.tagline}>{course.tagline}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
