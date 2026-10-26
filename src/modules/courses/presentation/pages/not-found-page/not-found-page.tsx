import { Link } from 'react-router';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';

export function NotFoundPage() {
  return (
    <PageStatus title="Página não encontrada">
      <p>
        O endereço pode ter mudado. <Link to="/cursos">Voltar para os cursos</Link>
      </p>
    </PageStatus>
  );
}
