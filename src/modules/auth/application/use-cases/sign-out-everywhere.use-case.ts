import type { AuthGateway } from '../ports/auth-gateway.interface';

export class SignOutEverywhereUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  execute(): Promise<void> {
    return this.authGateway.signOutEverywhere();
  }
}
