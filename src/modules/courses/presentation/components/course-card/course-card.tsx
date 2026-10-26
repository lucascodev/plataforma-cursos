import { Link } from 'react-router';
import styles from './course-card.module.css';

interface CourseCardProps {
  slug: string;
  title: string;
  tagline: string;
  level: string;
  audience: string;
  facts: readonly string[];
}

export function CourseCard({ slug, title, tagline, level, audience, facts }: CourseCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.level}>{level}</p>
      <h2 className={styles.title}>
        <Link className={styles.link} to={`/cursos/${slug}`}>
          {title}
        </Link>
      </h2>
      <p className={styles.tagline}>{tagline}</p>
      <p className={styles.audience}>Para quem: {audience}</p>
      <ul className={styles.facts}>
        {facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      <span className={styles.cta} aria-hidden="true">
        Abrir curso →
      </span>
    </article>
  );
}
