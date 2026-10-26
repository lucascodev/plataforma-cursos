import styles from './section-nav.module.css';

interface SectionNavProps {
  readonly label: string;
  readonly sections: readonly { readonly id: string; readonly label: string }[];
}

export function SectionNav({ label, sections }: SectionNavProps) {
  return (
    <nav className={styles.nav} aria-label={label}>
      <div className={styles.inner}>
        {sections.map((section) => (
          <a key={section.id} className={styles.link} href={`#${section.id}`}>
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
