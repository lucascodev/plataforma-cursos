import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import type { TeachingGateway } from '../../application/ports/teaching-gateway.interface';
import { HttpTeachingGateway } from '../../infra/gateways/http-teaching.gateway';

export function makeTeachingGateway(): TeachingGateway {
  return new HttpTeachingGateway(makeHttpClient());
}
