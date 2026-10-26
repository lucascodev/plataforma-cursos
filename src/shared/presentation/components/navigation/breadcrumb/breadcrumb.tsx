import { Link } from 'react-router';
import type { BreadcrumbItem } from '../../../types/navigation/breadcrumb-item.type';
import styles from './breadcrumb.module.css';

interface BreadcrumbProps {
  readonly items: readonly BreadcrumbItem[];
  readonly tone?: 'default' | 'ink';
}

export function Breadcrumb({ items, tone = 'default' }: BreadcrumbProps) {
  return (
    <nav aria-label="Você está em" className={tone === 'ink' ? `${styles.breadcrumb} ${styles.ink}` : styles.breadcrumb}>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={`${item.label}-${item.to ?? 'current'}`} className={styles.item}>
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
