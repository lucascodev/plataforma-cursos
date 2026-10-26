import { useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { AuditList } from '../../components/audit-list/audit-list';
import { useAuditQuery } from '../../hooks/use-audit-query/use-audit-query';
import styles from '../../styles/admin-page.module.css';

export function AdminHistoryPage() {
  const [params, setParams] = useSearchParams();
  const raw = Number(params.get('antes'));
  const before = Number.isSafeInteger(raw) && raw > 0 ? raw : null;
  const audit = useAuditQuery(before);

  return (
    <>
      <title>Histórico</title>
      <h1 className={styles.title}>Histórico</h1>
      <p className={styles.lead}>Cada aprovação, troca de papel e mudança em curso fica registrada aqui, com quem fez e quando. O registro não pode ser editado.</p>
      {audit.isPending ? (
        <PageStatus title="Carregando histórico…" />
      ) : audit.isError ? (
        <PageStatus title="Não foi possível carregar o histórico" />
      ) : (
        <>
          <AuditList entries={audit.data.items} />
          <div className={styles.pager}>
            {before !== null ? <Button onClick={() => setParams(new URLSearchParams())}>Mais recentes</Button> : null}
            {audit.data.nextBefore !== null ? (
              <Button onClick={() => setParams(new URLSearchParams({ antes: String(audit.data.nextBefore) }))}>Mais antigos</Button>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
