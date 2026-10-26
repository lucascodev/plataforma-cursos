import { NavLink } from 'react-router';
import styles from './profile-tabs.module.css';

const TABS = [
  { to: '/perfil', label: 'Perfil', end: true },
  { to: '/perfil/estudos', label: 'Estudos', end: false },
  { to: '/perfil/conta', label: 'Conta', end: false },
] as const;

export function ProfileTabs() {
  return (
    <nav className={styles.tabs} aria-label="Seções do perfil">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => (isActive ? `${styles.tab} ${styles.active}` : styles.tab)}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
