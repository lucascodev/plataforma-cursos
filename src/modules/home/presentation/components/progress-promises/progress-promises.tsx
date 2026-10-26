import { PROGRESS_PROMISES } from '../../constants/progress-promises';
import { PromiseIcon } from './components/promise-icon/promise-icon';
import styles from './progress-promises.module.css';

export function ProgressPromises() {
  return (
    <section className={styles.section} aria-labelledby="progresso-titulo">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.kicker}>Seu progresso</p>
          <h2 id="progresso-titulo" className={styles.title}>
            O que você fez fica com você.
          </h2>
        </div>
        <ul className={styles.cards}>
          {PROGRESS_PROMISES.map((promise) => (
            <li key={promise.title} className={styles.card}>
              <PromiseIcon name={promise.icon} />
              <h3 className={styles.cardTitle}>{promise.title}</h3>
              <p className={styles.cardText}>{promise.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
