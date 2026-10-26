import { Link } from 'react-router';
import type { CourseAuthor } from '../../../../../domain/entities/course/course-author.entity';
import styles from './course-author-line.module.css';

export function CourseAuthorLine({ author }: { author: CourseAuthor }) {
  return (
    <p className={styles.line}>
      {author.avatarUrl ? <img className={styles.avatar} src={author.avatarUrl} alt="" width={24} height={24} referrerPolicy="no-referrer" /> : null}
      <span>
        Curso de <Link to={`/professores/${author.handle}`}>{author.displayName}</Link>
      </span>
    </p>
  );
}
