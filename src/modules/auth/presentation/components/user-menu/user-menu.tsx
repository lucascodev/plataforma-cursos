import { Link, useLocation } from 'react-router';
import { useAuthSession } from '../../hooks/use-auth-session/use-auth-session';
import styles from './user-menu.module.css';

export function UserMenu() {
  const session = useAuthSession();
  const location = useLocation();
  if (session.status === 'loading') return null;

  return (
    <div className={styles.menu}>
      {session.user ? (
        // Keyed by path so the menu closes after following one of its links.
        <details key={location.pathname} className={styles.dropdown}>
          <summary className={styles.trigger}>
            {session.user.avatarUrl ? (
              <img className={styles.avatar} src={session.user.avatarUrl} alt="" width={28} height={28} referrerPolicy="no-referrer" />
            ) : (
              <span className={styles.initial} aria-hidden="true">
                {session.user.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className={styles.name}>{session.user.displayName}</span>
          </summary>
          <nav className={styles.panel} aria-label="Sua conta">
            <Link to="/perfil">Meu perfil</Link>
            <Link to="/minhas-propostas">Minhas propostas</Link>
            {session.user.role === 'admin' ? <Link to="/admin">Administração</Link> : null}
            <button type="button" className={styles.signOut} onClick={() => void session.signOut()}>
              Sair
            </button>
          </nav>
        </details>
      ) : location.pathname === '/entrar' ? null : (
        <Link className={styles.signIn} to="/entrar">
          Entrar
        </Link>
      )}
      {session.errorMessage ? (
        <p className={styles.error} role="alert">
          {session.errorMessage}
        </p>
      ) : null}
    </div>
  );
}
