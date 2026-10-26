import type { PersonCard } from '../../../domain/entities/person-card.entity';
import styles from './person-chip.module.css';

export function PersonChip({ person }: { person: PersonCard | null }) {
  if (!person) return <span className={styles.missing}>Ninguém</span>;
  return (
    <span className={styles.chip}>
      {person.avatarUrl ? <img className={styles.avatar} src={person.avatarUrl} alt="" width={22} height={22} referrerPolicy="no-referrer" /> : null}
      <span className={styles.name}>{person.displayName}</span>
      <span className={styles.handle}>@{person.handle}</span>
    </span>
  );
}
