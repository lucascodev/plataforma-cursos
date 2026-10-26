import styles from './stat-card.module.css';

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.card}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
