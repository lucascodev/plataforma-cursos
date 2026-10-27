import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class DeletePersonUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(personId: string): Promise<void> {
    return this.adminGateway.deletePerson(personId);
  }
}
