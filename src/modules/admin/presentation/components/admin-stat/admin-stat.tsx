import { Link } from 'react-router';
import styles from './admin-stat.module.css';

interface AdminStatProps {
  value: number;
  label: string;
  to?: string;
  highlight?: boolean;
}

export function AdminStat({ value, label, to, highlight = false }: AdminStatProps) {
  const content = (
    <>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </>
  );
  const className = highlight ? `${styles.stat} ${styles.highlight}` : styles.stat;
  return to ? (
    <Link className={className} to={to}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
