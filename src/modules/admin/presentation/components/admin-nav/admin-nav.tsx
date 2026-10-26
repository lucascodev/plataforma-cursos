import { NavLink } from 'react-router';
import styles from './admin-nav.module.css';

const LINKS = [
  { to: '/admin', label: 'Visão geral', end: true },
  { to: '/admin/propostas', label: 'Propostas', end: false },
  { to: '/admin/cursos', label: 'Cursos', end: false },
  { to: '/admin/pessoas', label: 'Pessoas e papéis', end: false },
  { to: '/admin/historico', label: 'Histórico', end: false },
] as const;

export function AdminNav() {
  return (
    <nav className={styles.nav} aria-label="Administração">
      <p className={styles.badge}>Admin</p>
      {LINKS.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
