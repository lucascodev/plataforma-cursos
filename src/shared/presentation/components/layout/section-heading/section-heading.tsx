import type { ReactNode } from 'react';
import styles from './section-heading.module.css';

interface SectionHeadingProps {
  id: string;
  title: string;
  aside?: ReactNode;
}

export function SectionHeading({ id, title, aside }: SectionHeadingProps) {
  return (
    <div className={styles.heading}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {aside ? <span className={styles.aside}>{aside}</span> : null}
    </div>
  );
}
