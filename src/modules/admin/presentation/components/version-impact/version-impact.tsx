import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { useVersionImpactQuery } from '../../hooks/use-version-impact-query/use-version-impact-query';
import styles from '../version-review/version-review.module.css';

export function VersionImpact({ versionId }: { readonly versionId: string }) {
  const impact = useVersionImpactQuery(versionId);
  if (impact.isPending) return <p className={styles.text}>Calculando o efeito em quem já estuda…</p>;
  if (impact.isError) return <p className={styles.text}>Não foi possível calcular o efeito em quem já estuda.</p>;
  const removed = Object.entries(impact.data.completedRemoved).filter(([, completed]) => completed > 0);
  const people = impact.data.students === 1 ? '1 pessoa estuda' : `${impact.data.students} pessoas estudam`;

  return (
    <>
      <p className={styles.text}>{people} este curso. Itens já concluídos continuam concluídos, porque cada aula tem id fixo.</p>
      {removed.length > 0 ? (
        <Notice tone="warning">
          <p>Aulas e exercícios que saem e já foram concluídos por alguém. A marca fica guardada, mas o item some do plano dessas pessoas:</p>
          <ul className={styles.list}>
            {removed.map(([key, completed]) => (
              <li key={key}>
                <code>{key}</code>: {completed === 1 ? '1 pessoa' : `${completed} pessoas`}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}
    </>
  );
}
