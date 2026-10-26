import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';

export function RouteErrorPage() {
  const error = useRouteError();
  const isMissing = isRouteErrorResponse(error) && error.status === 404;

  return (
    <PageStatus title={isMissing ? 'Página não encontrada' : 'Algo deu errado ao abrir esta página'}>
      <p>Se o site acabou de ser atualizado, recarregar a página costuma resolver. Seu progresso continua salvo.</p>
      <Button tone="primary" onClick={() => window.location.reload()}>
        Recarregar
      </Button>
    </PageStatus>
  );
}
