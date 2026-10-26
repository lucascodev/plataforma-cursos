import { HOW_IT_WORKS_STEPS } from '../../constants/how-it-works-steps';
import styles from './how-it-works.module.css';

export function HowItWorks() {
  return (
    <section id="como-funciona" className={styles.section} aria-labelledby="como-funciona-titulo">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.kicker}>Como funciona</p>
          <h2 id="como-funciona-titulo" className={styles.title}>
            Você sabe o que estudar hoje, e por quê.
          </h2>
        </div>
        <ol className={styles.steps}>
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
