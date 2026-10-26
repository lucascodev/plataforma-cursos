import { Link } from 'react-router';
import type { TodaySampleView } from '../../types/today-sample-view.type';
import { TodaySampleCard } from './components/today-sample-card/today-sample-card';
import styles from './home-hero.module.css';

export function HomeHero({ todaySample }: { readonly todaySample: TodaySampleView | null }) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Cursos gratuitos e de código aberto</p>
          <h1 className={styles.title}>Estude um pouco todo dia. Entregue um projeto por módulo.</h1>
          <p className={styles.lead}>
            Cada curso vira um plano diário a partir da data que você escolher, com aulas curtas, exercícios antes de cada projeto e o progresso salvo na sua conta.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} to="/cursos">
              Ver os cursos
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className={styles.secondary} to="/entrar">
              Entrar com GitHub
            </Link>
          </div>
          <p className={styles.note}>Sem anúncios e sem rastreamento. Você exporta ou apaga seus dados quando quiser.</p>
        </div>
        {todaySample ? <TodaySampleCard sample={todaySample} /> : null}
      </div>
    </section>
  );
}
