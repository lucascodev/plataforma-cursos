import type { AdminPerson } from '../../../domain/entities/people/admin-person.entity';
import type { PagedList } from '../../../domain/entities/paged-list.entity';
import type { ListPeopleInputDto } from '../../dtos/list-people-input.dto';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class ListPeopleUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(input: ListPeopleInputDto): Promise<PagedList<AdminPerson>> {
    return this.adminGateway.listPeople(input);
  }
}
