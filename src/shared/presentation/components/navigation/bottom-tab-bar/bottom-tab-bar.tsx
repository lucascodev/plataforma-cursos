import { NavLink } from 'react-router';
import type { NavItem } from '../../../types/navigation/nav-item.type';
import styles from './bottom-tab-bar.module.css';

export function BottomTabBar({ label, items }: { readonly label: string; readonly items: readonly NavItem[] }) {
  return (
    <nav aria-label={label} className={styles.bar}>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}>
          {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
