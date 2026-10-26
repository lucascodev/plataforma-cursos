import { ListPeopleUseCase } from '../../../application/use-cases/people/list-people.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeListPeople(): ListPeopleUseCase {
  return new ListPeopleUseCase(makeAdminGateway());
}
