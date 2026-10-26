import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import type { AdminGateway } from '../../application/ports/admin-gateway.interface';
import { HttpAdminGateway } from '../../infra/gateways/http-admin.gateway';

export function makeAdminGateway(): AdminGateway {
  return new HttpAdminGateway(makeHttpClient());
}
