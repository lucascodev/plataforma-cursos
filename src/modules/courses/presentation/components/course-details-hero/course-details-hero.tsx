import type { ReactNode } from 'react';
import { Breadcrumb } from '@/shared/presentation/components/navigation/breadcrumb/breadcrumb';
import type { Course } from '../../../domain/entities/course/course.entity';
import { lowerFirst } from '../../formatters/lower-first';
import { TeacherCard } from './components/teacher-card/teacher-card';
import styles from './course-details-hero.module.css';

interface CourseDetailsHeroProps {
  readonly course: Course;
  readonly facts: readonly string[];
  readonly aside: ReactNode;
}

export function CourseDetailsHero({ course, facts, aside }: CourseDetailsHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <Breadcrumb tone="ink" items={[{ label: 'Cursos', to: '/cursos' }, { label: course.title }]} />
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.kicker}>
              {course.level} · versão {course.version}
            </p>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.description}>{course.description}</p>
            <ul className={styles.facts}>
              {facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <p className={styles.audience}>Para {lowerFirst(course.audience)}</p>
            {course.author ? <TeacherCard author={course.author} /> : null}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
