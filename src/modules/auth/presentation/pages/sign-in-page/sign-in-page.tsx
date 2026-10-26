import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { GithubMark } from '../../components/github-mark/github-mark';
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
          <GithubMark />
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
