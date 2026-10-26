import styles from './course-facts.module.css';

interface CourseFactsProps {
  facts: readonly string[];
}

export function CourseFacts({ facts }: CourseFactsProps) {
  return (
    <ul className={styles.facts} aria-label="Resumo do curso">
      {facts.map((fact) => (
        <li key={fact} className={styles.fact}>
          {fact}
        </li>
      ))}
    </ul>
  );
}
