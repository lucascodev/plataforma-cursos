import { Link } from 'react-router';
import type { CourseAuthor } from '../../../../../domain/entities/course/course-author.entity';
import styles from './teacher-card.module.css';

export function TeacherCard({ author }: { readonly author: CourseAuthor }) {
  return (
    <Link className={styles.card} to={`/professores/${author.handle}`}>
      {author.avatarUrl ? (
        <img className={styles.avatar} src={author.avatarUrl} alt="" width={48} height={48} referrerPolicy="no-referrer" />
      ) : (
        <span className={styles.initial} aria-hidden="true">
          {author.displayName.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.role}>Professor</span>
        <span className={styles.name}>{author.displayName}</span>
        <span className={styles.headline}>{author.headline ? `${author.headline} · ver perfil` : 'Ver perfil'}</span>
      </span>
    </Link>
  );
}
