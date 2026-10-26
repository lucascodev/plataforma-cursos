import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import type { UserRole } from '../../../domain/types/user-role.type';
import { useAuthSession } from '../../hooks/use-auth-session/use-auth-session';

interface RequireRoleProps {
  roles: readonly UserRole[];
  returnPath: string;
  children: ReactNode;
}

// Only hides screens. Every API route checks the role again in the database.
export function RequireRole({ roles, returnPath, children }: RequireRoleProps) {
  const session = useAuthSession();
  if (session.status === 'loading') return <PageStatus title="Carregando…" />;
  if (!session.user) {
    return (
      <PageStatus title="Entre para continuar">
        <p>Esta área precisa de login com o GitHub.</p>
        <Button tone="primary" onClick={() => session.signIn(returnPath)}>
          Entrar com o GitHub
        </Button>
      </PageStatus>
    );
  }
  if (!roles.includes(session.user.role)) {
    return (
      <PageStatus title="Você não tem acesso a esta área">
        <p>
          <Link to="/">Voltar para os cursos</Link>
        </p>
      </PageStatus>
    );
  }
  return <>{children}</>;
}
