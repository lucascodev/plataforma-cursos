import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { useAuthSession } from '../../hooks/use-auth-session/use-auth-session';
import styles from './user-menu.module.css';

export function UserMenu() {
  const session = useAuthSession();
  const location = useLocation();
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  if (session.status === 'loading') return null;

  if (!session.user) {
    return location.pathname === '/entrar' ? null : (
      <Link className={styles.signIn} to="/entrar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
        </svg>
        Entrar com GitHub
      </Link>
    );
  }

  return (
    <>
      {/* Keyed by path so the menu closes after following one of its links. */}
      <details key={location.pathname} className={styles.dropdown}>
        <summary className={styles.trigger}>
          {session.user.avatarUrl ? (
            <img className={styles.avatar} src={session.user.avatarUrl} alt="" width={32} height={32} referrerPolicy="no-referrer" />
          ) : (
            <span className={styles.initial} aria-hidden="true">
              {session.user.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className={styles.name}>{session.user.displayName}</span>
        </summary>
        <nav className={styles.panel} aria-label="Sua conta">
          <Link to="/perfil">Meu perfil</Link>
          <Link to="/perfil/estudos">Meus estudos</Link>
          <Link to="/minhas-propostas">Minhas propostas</Link>
          {session.user.role === 'admin' ? <Link to="/admin">Administração</Link> : null}
          <button type="button" className={styles.signOut} onClick={() => setIsConfirmingSignOut(true)}>
            Sair
          </button>
        </nav>
      </details>
      <Dialog
        open={isConfirmingSignOut}
        title="Sair da conta?"
        description={<p>Seu progresso continua salvo na conta. Para voltar, é só entrar com o GitHub de novo.</p>}
        onClose={() => setIsConfirmingSignOut(false)}
        actions={
          <>
            <Button size="md" onClick={() => setIsConfirmingSignOut(false)}>
              Ficar
            </Button>
            <Button
              size="md"
              tone="strong"
              onClick={() => {
                setIsConfirmingSignOut(false);
                void session.signOut();
              }}
            >
              Sair
            </Button>
          </>
        }
      />
    </>
  );
}
