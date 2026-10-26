import { SignInWithGitHubUseCase } from '../../application/use-cases/sign-in-with-github.use-case';
import { makeAuthGateway } from './make-auth-gateway.factory';

export function makeSignInWithGitHub(): SignInWithGitHubUseCase {
  return new SignInWithGitHubUseCase(makeAuthGateway());
}
