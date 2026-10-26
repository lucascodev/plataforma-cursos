import type { SignInWithGitHubInputDto } from '../dtos/sign-in-with-github/sign-in-with-github-input.dto';
import type { AuthGateway } from '../ports/auth-gateway.interface';

export class SignInWithGitHubUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  execute(input: SignInWithGitHubInputDto): void {
    this.authGateway.signInWithGitHub(input.returnPath);
  }
}
