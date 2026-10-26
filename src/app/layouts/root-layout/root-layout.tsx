import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { useAuthSession, UserMenu } from '@/modules/auth';
import { ThemeSync } from '@/modules/profiles';
import { makeSiteConfig } from '@/shared/main/factories/make-site-config.factory';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { SkipLink } from '@/shared/presentation/components/navigation/skip-link/skip-link';
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
            {site.name}
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            <NavLink to="/" end className={navClass}>
              Cursos
            </NavLink>
            <NavLink to="/propor-curso" className={navClass}>
              Propor curso
            </NavLink>
            {session.user?.role === 'admin' ? (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            ) : null}
          </nav>
          <UserMenu />
        </div>
      </header>
      <NewVersionBanner />
      <main id="conteudo" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>
          {site.name} · código sob licença {site.codeLicense}, conteúdo sob {site.contentLicense}.
        </p>
        <p>
          <ExternalLink href={site.repositoryUrl}>Código-fonte</ExternalLink> · <Link to="/privacidade">Privacidade</Link>
        </p>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
