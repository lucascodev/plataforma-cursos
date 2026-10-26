import type { ReactNode } from 'react';
import styles from './stat-tile.module.css';

interface StatTileProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly hint?: ReactNode;
}

// A term/definition pair: render the tiles inside a <dl>.
export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className={styles.tile}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
      {hint ? <dd className={styles.hint}>{hint}</dd> : null}
    </div>
  );
}
