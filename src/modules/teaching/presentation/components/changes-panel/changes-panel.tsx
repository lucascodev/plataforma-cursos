import type { CourseDiff } from '@contracts/version/diff/course-diff.type';
import styles from '../checks-panel/checks-panel.module.css';

interface ChangesPanelProps {
  readonly diff: CourseDiff;
  readonly isFirstVersion: boolean;
}

export function ChangesPanel({ diff, isFirstVersion }: ChangesPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="mudancas">
      <h2 id="mudancas" className={styles.title}>
        {isFirstVersion ? 'Primeira versão' : 'Mudanças nesta versão'}
      </h2>
      {isFirstVersion ? <p className={styles.note}>Nada foi publicado ainda: tudo o que está aqui entra no ar na primeira publicação.</p> : null}
      {!isFirstVersion && diff.changes.length === 0 ? <p className={styles.note}>Nenhuma mudança em relação à versão publicada.</p> : null}
      {!isFirstVersion ? (
        <ul className={styles.list}>
          {diff.changes.map((change) => (
            <li key={change.text}>{change.text}</li>
          ))}
        </ul>
      ) : null}
      {diff.removedItemKeys.length > 0 ? (
        <p className={styles.note}>
          {diff.removedItemKeys.length} {diff.removedItemKeys.length === 1 ? 'aula ou exercício publicado sai' : 'aulas ou exercícios publicados saem'} nesta
          versão. Quem marcou como feito perde essas marcas.
        </p>
      ) : null}
    </section>
  );
}
