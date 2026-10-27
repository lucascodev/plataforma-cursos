import type { AuthGateway } from '../ports/auth-gateway.interface';

export class DeleteAccountUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  execute(): Promise<void> {
    return this.authGateway.deleteAccount();
  }
}
