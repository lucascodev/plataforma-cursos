import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { COURSE_FILE_EXAMPLE } from '../../constants/course-file-example';
import styles from './open-source.module.css';

interface OpenSourceProps {
  readonly repositoryUrl: string;
  readonly guideUrl: string;
  readonly codeLicense: string;
  readonly contentLicense: string;
}

export function OpenSource({ repositoryUrl, guideUrl, codeLicense, contentLicense }: OpenSourceProps) {
  return (
    <section id="aberto" className={styles.section} aria-labelledby="aberto-titulo">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Aberto de verdade</p>
          <h2 id="aberto-titulo" className={styles.title}>
            Use, adapte e proponha o seu próprio curso.
          </h2>
          <p className={styles.text}>
            O código é {codeLicense} e o conteúdo é {contentLicense}. Um curso é um arquivo JSON validado pelo mesmo schema que o site usa.
          </p>
          <div className={styles.links}>
            <ExternalLink href={repositoryUrl}>Ver o código-fonte</ExternalLink>
            <ExternalLink href={guideUrl}>Como criar um curso</ExternalLink>
          </div>
        </div>
        <pre className={styles.code} tabIndex={0} aria-label="Exemplo de arquivo de curso">
          <code>{COURSE_FILE_EXAMPLE}</code>
        </pre>
      </div>
    </section>
  );
}
