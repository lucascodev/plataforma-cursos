import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { AdminStat } from '../../components/admin-stat/admin-stat';
import { AttentionQueue } from '../../components/attention-queue/attention-queue';
import { RecentActivity } from '../../components/recent-activity/recent-activity';
import { useAdminOverviewQuery } from '../../hooks/use-admin-overview-query/use-admin-overview-query';
import { useNavBadgesQuery } from '../../hooks/use-nav-badges-query/use-nav-badges-query';
import styles from '../../styles/admin-page.module.css';

export function AdminOverviewPage() {
  const overview = useAdminOverviewQuery();
  const badges = useNavBadgesQuery();
  if (overview.isPending) return <PageStatus title="Carregando…" />;
  if (overview.isError) return <PageStatus title="Não foi possível carregar a visão geral" />;
  const data = overview.data;
  const versionsInReview = badges.data?.versionsInReview ?? 0;

  return (
    <>
      <title>Administração</title>
      <h1 className={styles.title}>Visão geral</h1>
      <div className={styles.grid}>
        <AdminStat value={data.pendingProposals} label="propostas esperando" to="/admin/propostas?status=pending" highlight={data.pendingProposals > 0} />
        <AdminStat value={versionsInReview} label="versões para revisar" to="/admin/cursos?situacao=review" highlight={versionsInReview > 0} />
        <AdminStat value={data.courses.published} label="cursos no catálogo" to="/admin/cursos?situacao=published" />
        <AdminStat value={data.activeStudents30d} label="estudantes ativos em 30 dias" />
      </div>
      <div className={styles.columns}>
        <AttentionQueue />
        <RecentActivity />
      </div>
      <div className={styles.grid}>
        <AdminStat value={data.people.student} label="estudantes" to="/admin/pessoas?role=student" />
        <AdminStat value={data.people.teacher} label="professores" to="/admin/pessoas?role=teacher" />
        <AdminStat value={data.people.admin} label="admins" to="/admin/pessoas?role=admin" />
        <AdminStat value={data.courses.draft} label="cursos nunca publicados" to="/admin/cursos?situacao=draft" />
      </div>
      <p className={styles.muted}>Números somados. Anotações, diário e progresso de cada pessoa nunca aparecem aqui.</p>
    </>
  );
}
