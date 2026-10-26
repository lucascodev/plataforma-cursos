import type { AuthUser } from '../../domain/entities/auth-user.entity';
import type { AuthGateway } from '../ports/auth-gateway.interface';

export class GetCurrentUserUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  execute(): Promise<AuthUser | null> {
    return this.authGateway.getCurrentUser();
  }
}
