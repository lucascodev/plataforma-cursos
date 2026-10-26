import type { ReactNode } from 'react';
import styles from './course-hero.module.css';
import { CourseFacts } from './components/course-facts/course-facts';

interface CourseHeroProps {
  title: string;
  tagline: string;
  description: string;
  facts: readonly string[];
  children?: ReactNode;
}

export function CourseHero({ title, tagline, description, facts, children }: CourseHeroProps) {
  return (
    <header className={styles.hero}>
      <p className={styles.kicker}>{tagline}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <CourseFacts facts={facts} />
      {children ? <div className={styles.controls}>{children}</div> : null}
    </header>
  );
}
