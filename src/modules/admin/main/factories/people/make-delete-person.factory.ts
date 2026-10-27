import { DeletePersonUseCase } from '../../../application/use-cases/people/delete-person.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeDeletePerson(): DeletePersonUseCase {
  return new DeletePersonUseCase(makeAdminGateway());
}
