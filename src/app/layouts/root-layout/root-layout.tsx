import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { UserMenu } from '@/modules/auth';
import { makeSiteConfig } from '@/shared/main/factories/make-site-config.factory';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { SkipLink } from '@/shared/presentation/components/navigation/skip-link/skip-link';
import styles from './root-layout.module.css';

export function RootLayout() {
  const site = makeSiteConfig();

  return (
    <div className={styles.shell}>
      <SkipLink targetId="conteudo" label="Pular para o conteúdo" />
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link className={styles.brand} to="/">
            {site.name}
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            <NavLink to="/" end className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}>
              Cursos
            </NavLink>
            <NavLink to="/privacidade" className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}>
              Privacidade
            </NavLink>
          </nav>
          <UserMenu />
        </div>
      </header>
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
