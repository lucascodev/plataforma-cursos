import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import type { AuthGateway } from '../../application/ports/auth-gateway.interface';
import { HttpAuthGateway } from '../../infra/gateways/http-auth.gateway';

export function makeAuthGateway(): AuthGateway {
  return new HttpAuthGateway(makeHttpClient(), (url) => window.location.assign(url));
}
