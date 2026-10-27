import { Link } from 'react-router';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import type { AttentionItem } from '../../../domain/entities/attention-item.entity';
import { describeWaiting } from '../../formatters/describe-waiting';
import { useAttentionQueueQuery } from '../../hooks/use-attention-queue-query/use-attention-queue-query';
import styles from './attention-queue.module.css';

function describeItem(item: AttentionItem, now: number) {
  const waiting = describeWaiting(item.since, now);
  switch (item.kind) {
    case 'proposal':
      return { tag: 'Proposta', tone: 'warning' as const, to: `/admin/propostas/${item.id}`, text: `${item.title} · esperando ${waiting}` };
    case 'version':
      return {
        tag: 'Revisão',
        tone: 'accent' as const,
        to: `/admin/versoes/${item.id}`,
        text: `${item.title}${item.semver ? ` v${item.semver}` : ''} · ${item.firstPublication ? 'primeira publicação' : 'nova versão'}, ${waiting}`,
      };
    case 'report':
      return {
        tag: 'Aviso',
        tone: 'danger' as const,
        to: '/admin/avisos',
        text: `${item.count === 1 ? '1 aviso' : `${item.count} avisos`} sobre ${item.title} (@${item.handle}) · ${waiting}`,
      };
  }
}

export function AttentionQueue() {
  const queue = useAttentionQueueQuery();
  const now = Date.now();

  return (
    <section className={styles.panel} aria-labelledby="precisa-de-voce">
      <h2 id="precisa-de-voce" className={styles.title}>
        Precisa de você
      </h2>
      {queue.isPending ? <p className={styles.muted}>Carregando…</p> : null}
      {queue.isError ? <p className={styles.muted}>Não foi possível carregar a fila agora.</p> : null}
      {queue.data?.length === 0 ? <p className={styles.muted}>Nada esperando. Tudo em dia.</p> : null}
      <ul className={styles.list}>
        {queue.data?.map((item) => {
          const view = describeItem(item, now);
          return (
            <li key={`${item.kind}-${item.id}`}>
              <Link className={styles.item} to={view.to}>
                <Badge tone={view.tone}>{view.tag}</Badge>
                <span>{view.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
