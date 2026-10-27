import { NavLink } from 'react-router';
import type { NavBadges } from '../../../domain/entities/nav-badges.entity';
import { useNavBadgesQuery } from '../../hooks/use-nav-badges-query/use-nav-badges-query';
import styles from './admin-nav.module.css';

const LINKS: readonly { readonly to: string; readonly label: string; readonly end: boolean; readonly badge?: keyof NavBadges }[] = [
  { to: '/admin', label: 'Visão geral', end: true },
  { to: '/admin/propostas', label: 'Propostas', end: false, badge: 'pendingProposals' },
  { to: '/admin/cursos', label: 'Cursos', end: false, badge: 'versionsInReview' },
  { to: '/admin/pessoas', label: 'Pessoas e papéis', end: false },
  { to: '/admin/avisos', label: 'Avisos', end: false, badge: 'openReports' },
  { to: '/admin/historico', label: 'Histórico', end: false },
];

export function AdminNav() {
  const badges = useNavBadgesQuery();
  return (
    <nav className={styles.nav} aria-label="Administração">
      <p className={styles.badge}>Admin</p>
      {LINKS.map((link) => {
        const count = link.badge ? (badges.data?.[link.badge] ?? 0) : 0;
        return (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}>
            {link.label}
            {count > 0 ? (
              <span className={styles.count} aria-label={`${count} esperando`}>
                {count}
              </span>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
}
