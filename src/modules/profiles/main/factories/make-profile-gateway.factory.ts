import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import type { ProfileGateway } from '../../application/ports/profile-gateway.interface';
import { HttpProfileGateway } from '../../infra/gateways/http-profile.gateway';

export function makeProfileGateway(): ProfileGateway {
  return new HttpProfileGateway(makeHttpClient());
}
