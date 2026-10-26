import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { TodaySampleView } from '../../types/today-sample-view.type';
import { TodaySampleCard } from './components/today-sample-card/today-sample-card';
import styles from './home-hero.module.css';

interface HomeHeroProps {
  readonly todaySample: TodaySampleView | null;
  readonly account: { readonly label: string; readonly to: string } | null;
}

export function HomeHero({ todaySample, account }: HomeHeroProps) {
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
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {account ? (
              <Link className={styles.secondary} to={account.to}>
                {account.label}
              </Link>
            ) : null}
          </div>
          <p className={styles.note}>Sem anúncios e sem rastreamento. Você exporta ou apaga seus dados quando quiser.</p>
        </div>
        {todaySample ? <TodaySampleCard sample={todaySample} /> : null}
      </div>
    </section>
  );
}
