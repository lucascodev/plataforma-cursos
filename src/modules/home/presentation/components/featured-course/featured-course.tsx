import { Link } from 'react-router';
import type { FeaturedCourseView } from '../../types/featured-course-view.type';
import styles from './featured-course.module.css';

export function FeaturedCourse({ course }: { readonly course: FeaturedCourseView }) {
  return (
    <section className={styles.section} aria-labelledby="curso-destaque-titulo">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Curso em destaque · {course.level}</p>
          <h2 id="curso-destaque-titulo" className={styles.title}>
            {course.title}
          </h2>
          <p className={styles.tagline}>{course.tagline}</p>
          <ul className={styles.facts}>
            {course.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Link className={styles.primary} to={`/cursos/${course.slug}`}>
              Ver o curso
            </Link>
            <Link className={styles.secondary} to={`/cursos/${course.slug}/comecar`}>
              Começar hoje
            </Link>
          </div>
        </div>
        <div className={styles.trail}>
          <p className={styles.trailTitle}>A trilha</p>
          <ol className={styles.modules}>
            {course.trail.map((module) => (
              <li key={module.id} className={styles.module}>
                <span className={module.isCapstone ? `${styles.code} ${styles.capstone}` : styles.code}>{module.code}</span>
                <span className={styles.moduleTitle}>{module.title}</span>
                <span className={styles.meta}>{module.meta}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
