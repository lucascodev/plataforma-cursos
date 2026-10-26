import type { AuditEntry } from '../../../domain/entities/audit-entry.entity';
import { describeAuditEntry } from '../../formatters/describe-audit-entry';
import { formatDateTime } from '../../formatters/format-date-time';
import styles from './audit-list.module.css';

export function AuditList({ entries }: { entries: readonly AuditEntry[] }) {
  if (entries.length === 0) return <p className={styles.empty}>Nada registrado ainda.</p>;
  return (
    <ol className={styles.list}>
      {entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <time className={styles.time} dateTime={entry.at}>
            {formatDateTime(entry.at)}
          </time>
          <span>
            <strong>{entry.actor ? entry.actor.displayName : 'Sistema'}</strong> {describeAuditEntry(entry)}
          </span>
        </li>
      ))}
    </ol>
  );
}
