import { useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import type { AuditKind } from '../../../domain/types/audit-kind.type';
import { AuditList } from '../../components/audit-list/audit-list';
import { FilterChips } from '../../components/filter-chips/filter-chips';
import { useAuditQuery } from '../../hooks/use-audit-query/use-audit-query';
import styles from '../../styles/admin-page.module.css';

const KINDS: readonly { readonly value: AuditKind | null; readonly label: string }[] = [
  { value: null, label: 'Tudo' },
  { value: 'courses', label: 'Cursos' },
  { value: 'proposals', label: 'Propostas' },
  { value: 'people', label: 'Pessoas' },
];
const readKind = (value: string | null): AuditKind | null => KINDS.find((kind) => kind.value === value)?.value ?? null;

export function AdminHistoryPage() {
  const [params, setParams] = useSearchParams();
  const raw = Number(params.get('antes'));
  const before = Number.isSafeInteger(raw) && raw > 0 ? raw : null;
  const kind = readKind(params.get('tipo'));
  const audit = useAuditQuery(before, kind);
  const go = (next: { tipo?: string | null; antes?: number | null }) => {
    const merged = new URLSearchParams();
    const nextKind = next.tipo === undefined ? kind : next.tipo;
    if (nextKind) merged.set('tipo', nextKind);
    if (next.antes) merged.set('antes', String(next.antes));
    setParams(merged);
  };

  return (
    <>
      <title>Histórico</title>
      <h1 className={styles.title}>Histórico</h1>
      <p className={styles.lead}>Tudo o que muda cursos, propostas, papéis e contas fica registrado aqui, com quem fez e quando. Ninguém consegue apagar.</p>
      <FilterChips label="Filtrar o histórico" options={KINDS} selected={kind} onSelect={(value) => go({ tipo: value, antes: null })} />
      {audit.isPending ? (
        <PageStatus title="Carregando histórico…" />
      ) : audit.isError ? (
        <PageStatus title="Não foi possível carregar o histórico" />
      ) : (
        <>
          {audit.data.items.length === 0 ? <p className={styles.muted}>Nada registrado ainda.</p> : <AuditList entries={audit.data.items} />}
          <div className={styles.pager}>
            {before !== null ? <Button onClick={() => go({ antes: null })}>Mais recentes</Button> : null}
            {audit.data.nextBefore !== null ? <Button onClick={() => go({ antes: audit.data.nextBefore })}>Mais antigos</Button> : null}
          </div>
        </>
      )}
    </>
  );
}
