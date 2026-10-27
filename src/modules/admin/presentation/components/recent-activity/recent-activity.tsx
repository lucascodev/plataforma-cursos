import { Link } from 'react-router';
import { useAuditQuery } from '../../hooks/use-audit-query/use-audit-query';
import styles from '../attention-queue/attention-queue.module.css';
import { AuditList } from '../audit-list/audit-list';

const RECENT = 6;

export function RecentActivity() {
  const audit = useAuditQuery(null, null);
  return (
    <section className={styles.panel} aria-labelledby="atividade-recente">
      <h2 id="atividade-recente" className={styles.title}>
        Atividade recente
      </h2>
      {audit.isPending ? <p className={styles.muted}>Carregando…</p> : null}
      {audit.isError ? <p className={styles.muted}>Não foi possível carregar a atividade agora.</p> : null}
      {audit.data ? <AuditList entries={audit.data.items.slice(0, RECENT)} /> : null}
      <Link to="/admin/historico">Ver o histórico</Link>
    </section>
  );
}
