import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import type { GuideSection } from '../../../../../domain/entities/guide/guide-section.entity';
import styles from './guide-section-card.module.css';

interface GuideSectionCardProps {
  section: GuideSection;
}

export function GuideSectionCard({ section }: GuideSectionCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{section.title}</h3>
      {section.intro ? <p className={styles.intro}>{section.intro}</p> : null}
      <ul className={styles.list}>
        {section.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {section.link ? <ExternalLink href={section.link.url}>{section.link.label}</ExternalLink> : null}
    </article>
  );
}
