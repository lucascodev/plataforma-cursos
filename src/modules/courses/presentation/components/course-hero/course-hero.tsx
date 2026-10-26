import type { ReactNode } from 'react';
import styles from './course-hero.module.css';
import type { CourseAuthor } from '../../../domain/entities/course/course-author.entity';
import { CourseAuthorLine } from './components/course-author-line/course-author-line';
import { CourseFacts } from './components/course-facts/course-facts';

interface CourseHeroProps {
  title: string;
  tagline: string;
  description: string;
  facts: readonly string[];
  author?: CourseAuthor | null;
  children?: ReactNode;
}

export function CourseHero({ title, tagline, description, facts, author = null, children }: CourseHeroProps) {
  return (
    <header className={styles.hero}>
      <p className={styles.kicker}>{tagline}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {author ? <CourseAuthorLine author={author} /> : null}
      <CourseFacts facts={facts} />
      {children ? <div className={styles.controls}>{children}</div> : null}
    </header>
  );
}
