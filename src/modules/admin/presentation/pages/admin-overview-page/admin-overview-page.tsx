import { Link } from 'react-router';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { AdminStat } from '../../components/admin-stat/admin-stat';
import { useAdminOverviewQuery } from '../../hooks/use-admin-overview-query/use-admin-overview-query';
import styles from '../../styles/admin-page.module.css';

export function AdminOverviewPage() {
  const overview = useAdminOverviewQuery();
  if (overview.isPending) return <PageStatus title="Carregando…" />;
  if (overview.isError) return <PageStatus title="Não foi possível carregar a visão geral" />;
  const data = overview.data;

  return (
    <>
      <title>Administração</title>
      <h1 className={styles.title}>Visão geral</h1>
      <div className={styles.grid}>
        <AdminStat value={data.pendingProposals} label="propostas na fila" to="/admin/propostas?status=pending" highlight={data.pendingProposals > 0} />
        <AdminStat value={data.activeStudents30d} label="estudantes ativos em 30 dias" />
        <AdminStat value={data.courses.published} label="cursos no catálogo" to="/admin/cursos" />
        <AdminStat value={data.courses.draft} label="cursos em rascunho" to="/admin/cursos" />
        <AdminStat value={data.courses.unlisted} label="cursos fora do catálogo" to="/admin/cursos" />
      </div>
      <div className={styles.grid}>
        <AdminStat value={data.people.student} label="estudantes" to="/admin/pessoas?role=student" />
        <AdminStat value={data.people.teacher} label="professores" to="/admin/pessoas?role=teacher" />
        <AdminStat value={data.people.admin} label="admins" to="/admin/pessoas?role=admin" />
      </div>
      <p className={styles.muted}>
        Números agregados. Notas, diário e respostas das pessoas nunca aparecem aqui. Toda ação desta área fica no{' '}
        <Link to="/admin/historico">histórico</Link>.
      </p>
    </>
  );
}
