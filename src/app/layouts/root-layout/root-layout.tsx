import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { SessionMessageBanner, useAuthSession, UserMenu } from '@/modules/auth';
import { ThemeSync } from '@/modules/profiles';
import { makeSiteConfig } from '@/shared/main/factories/make-site-config.factory';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { SkipLink } from '@/shared/presentation/components/navigation/skip-link/skip-link';
import { BrandMark } from './components/brand-mark/brand-mark';
import { NewVersionBanner } from './components/new-version-banner/new-version-banner';
import styles from './root-layout.module.css';

export function RootLayout() {
  const site = makeSiteConfig();
  const session = useAuthSession();
  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink);

  return (
    <div className={styles.shell}>
      <ThemeSync />
      <SkipLink targetId="conteudo" label="Pular para o conteúdo" />
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link className={styles.brand} to="/">
            <BrandMark />
            {site.name}
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            <NavLink to="/cursos" className={navClass}>
              Cursos
            </NavLink>
            {session.user ? (
              <NavLink to="/perfil/estudos" className={navClass}>
                Meus estudos
              </NavLink>
            ) : null}
            {session.user?.role === 'teacher' || session.user?.role === 'admin' ? (
              <NavLink to="/professor" className={navClass}>
                Área do professor
              </NavLink>
            ) : (
              <NavLink to="/propor-curso" className={navClass}>
                Propor curso
              </NavLink>
            )}
            {session.user?.role === 'admin' ? (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            ) : null}
          </nav>
          <UserMenu />
        </div>
      </header>
      <SessionMessageBanner />
      <NewVersionBanner />
      <main id="conteudo" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerBar}>
          <p>
            {site.name} · código sob {site.codeLicense}, conteúdo sob {site.contentLicense}.
          </p>
          <nav className={styles.footerNav} aria-label="Rodapé">
            <Link to="/cursos">Cursos</Link>
            <ExternalLink href={site.repositoryUrl}>Código-fonte</ExternalLink>
            <Link to="/privacidade">Privacidade</Link>
          </nav>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
