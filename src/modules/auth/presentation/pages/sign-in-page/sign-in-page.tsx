import { Link, Navigate, useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { useAuthSession } from '../../hooks/use-auth-session/use-auth-session';
import styles from './sign-in-page.module.css';

export function SignInPage() {
  const session = useAuthSession();
  const [params] = useSearchParams();
  const loginFailed = params.get('erro') === 'login';

  if (session.status === 'signed-in') return <Navigate to="/" replace />;

  return (
    <section className={styles.page} aria-labelledby="entrar-titulo">
      <title>Entrar</title>
      <h1 id="entrar-titulo" className={styles.title}>
        Entrar
      </h1>
      <p className={styles.lead}>Use sua conta do GitHub. O plano, o progresso, as anotações e o diário ficam salvos na sua conta e aparecem em qualquer aparelho.</p>
      {loginFailed ? (
        <p className={styles.alert} role="alert">
          Não foi possível concluir o login com o GitHub. Tente de novo.
        </p>
      ) : null}
      <Button tone="primary" className={styles.action} disabled={session.status === 'loading'} onClick={() => session.signIn('/')}>
        Entrar com GitHub
      </Button>
      <ul className={styles.facts}>
        <li>Pedimos só o seu perfil público. Nada de acesso aos seus repositórios.</li>
        <li>A sessão fica num cookie que o JavaScript da página não consegue ler.</li>
        <li>
          Veja o que guardamos e como apagar em <Link to="/privacidade">Privacidade</Link>.
        </li>
      </ul>
    </section>
  );
}
