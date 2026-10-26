import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { safeReturnPath } from '../../../domain/rules/safe-return-path.rule';
import { SIGN_IN_BENEFITS } from '../../constants/sign-in-benefits';
import { useAuthSession } from '../../hooks/use-auth-session/use-auth-session';
import styles from './sign-in-page.module.css';

const DEFAULT_RETURN_PATH = '/';

export function SignInPage() {
  const session = useAuthSession();
  const [params] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const loginFailed = params.get('erro') === 'login';
  const returnPath = safeReturnPath(params.get('voltar'), DEFAULT_RETURN_PATH);

  if (session.status === 'signed-in') return <Navigate to={returnPath} replace />;

  return (
    <div className={styles.page}>
      <title>Entrar</title>
      <section className={styles.main} aria-labelledby="entrar-titulo">
        <div className={styles.heading}>
          <h1 id="entrar-titulo" className={styles.title}>
            Entre para estudar com plano e progresso salvo
          </h1>
          <p className={styles.lead}>Use a sua conta do GitHub. Não precisa criar senha nova.</p>
        </div>
        {loginFailed ? (
          <Banner tone="danger" title="Não foi possível entrar.">
            <p>O login foi cancelado ou o GitHub não respondeu. Tente de novo.</p>
          </Banner>
        ) : null}
        <Button tone="strong" size="lg" className={styles.action} disabled={session.status === 'loading'} onClick={() => setIsConfirming(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.2-3.1-.1-.4-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.1 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
          </svg>
          Entrar com GitHub
        </Button>
        <div className={styles.facts}>
          <p className={styles.factsTitle}>O que acontece ao entrar</p>
          <ul>
            <li>Guardamos só o seu nome público, a foto do perfil e o que você faz nos cursos.</li>
            <li>Não pedimos acesso aos seus repositórios.</li>
            <li>A sessão fica num cookie que o JavaScript da página não consegue ler.</li>
          </ul>
        </div>
        <p className={styles.legal}>
          Ao entrar, você concorda com a <Link to="/privacidade">política de privacidade</Link>. Você pode apagar seu progresso quando quiser.
        </p>
      </section>
      <aside className={styles.aside} aria-labelledby="entrar-beneficios">
        <p id="entrar-beneficios" className={styles.asideTitle}>
          Com a conta você ganha
        </p>
        <ul className={styles.benefits}>
          {SIGN_IN_BENEFITS.map((benefit) => (
            <li key={benefit.title}>
              <p className={styles.benefitTitle}>{benefit.title}</p>
              <p className={styles.benefitText}>{benefit.text}</p>
            </li>
          ))}
        </ul>
      </aside>
      <Dialog
        open={isConfirming}
        title="Você vai para o GitHub"
        description={<p>Lá, autorize o aplicativo Cursos Abertos. Depois você volta para cá, já conectado.</p>}
        onClose={() => setIsConfirming(false)}
        actions={
          <>
            <Button size="md" onClick={() => setIsConfirming(false)}>
              Cancelar
            </Button>
            <Button size="md" tone="primary" onClick={() => session.signIn(returnPath)}>
              Continuar no GitHub
            </Button>
          </>
        }
      >
        <ul className={styles.dialogList}>
          <li>Acesso pedido: perfil público e e-mail.</li>
          <li>Nenhum acesso aos seus repositórios.</li>
        </ul>
      </Dialog>
    </div>
  );
}
