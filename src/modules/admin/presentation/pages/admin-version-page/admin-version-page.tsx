import { Link, useParams } from 'react-router';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { VersionReview } from '../../components/version-review/version-review';
import { useAdminVersionQuery } from '../../hooks/use-admin-version-query/use-admin-version-query';

export function AdminVersionPage() {
  const { id = '' } = useParams();
  const detail = useAdminVersionQuery(id);

  if (detail.isPending) return <PageStatus title="Carregando a versão…" />;
  if (detail.isError) return <PageStatus title="Não foi possível carregar a versão" />;
  if (!detail.data) {
    return (
      <PageStatus title="Versão não encontrada">
        <Link to="/admin/cursos">Voltar para os cursos</Link>
      </PageStatus>
    );
  }
  return <VersionReview key={detail.data.version.id} detail={detail.data} />;
}
