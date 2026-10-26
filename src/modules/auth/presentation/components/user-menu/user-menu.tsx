import { Link, useLocation } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { useAuthSession } from '../../hooks/use-auth-session/use-auth-session';
import styles from './user-menu.module.css';

export function UserMenu() {
  const session = useAuthSession();
  const location = useLocation();
  if (session.status === 'loading') return null;

  return (
    <div className={styles.menu}>
      {session.user ? (
        <>
          {session.user.avatarUrl ? (
            <img className={styles.avatar} src={session.user.avatarUrl} alt="" width={28} height={28} referrerPolicy="no-referrer" />
          ) : null}
          <span className={styles.name}>{session.user.displayName}</span>
          <Button onClick={() => void session.signOut()}>Sair</Button>
        </>
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
