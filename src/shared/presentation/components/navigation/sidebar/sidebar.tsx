import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import type { NavItem } from '../../../types/navigation/nav-item.type';
import styles from './sidebar.module.css';

interface SidebarProps {
  readonly label: string;
  readonly items: readonly NavItem[];
  readonly header?: ReactNode;
  readonly footer?: ReactNode;
}

export function Sidebar({ label, items, header, footer }: SidebarProps) {
  return (
    <nav aria-label={label} className={styles.sidebar}>
      {header ? <div className={styles.header}>{header}</div> : null}
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}>
              {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
}
