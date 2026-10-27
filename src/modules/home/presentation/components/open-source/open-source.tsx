import { Link } from 'react-router';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { TEACHING_STEPS } from '../../constants/teaching-steps';
import styles from './open-source.module.css';

interface OpenSourceProps {
  readonly repositoryUrl: string;
  readonly codeLicense: string;
  readonly contentLicense: string;
}

export function OpenSource({ repositoryUrl, codeLicense, contentLicense }: OpenSourceProps) {
  return (
    <section id="aberto" className={styles.section} aria-labelledby="aberto-titulo">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Aberto de verdade</p>
          <h2 id="aberto-titulo" className={styles.title}>
            Use, adapte e proponha o seu próprio curso.
          </h2>
          <p className={styles.text}>
            O código é {codeLicense} e o conteúdo é {contentLicense}. Para ensinar aqui, mande uma proposta: se for aprovada, você escreve o curso no
            editor da plataforma.
          </p>
          <div className={styles.links}>
            <Link to="/propor-curso">Propor um curso</Link>
            <ExternalLink href={repositoryUrl}>Ver o código-fonte</ExternalLink>
          </div>
        </div>
        <ol className={styles.steps}>
          {TEACHING_STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <strong className={styles.stepTitle}>{step.title}</strong>
                {step.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
