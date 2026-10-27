import { PublishVersionUseCase } from '../../../application/use-cases/versions/publish-version.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makePublishVersion(): PublishVersionUseCase {
  return new PublishVersionUseCase(makeAdminGateway());
}
