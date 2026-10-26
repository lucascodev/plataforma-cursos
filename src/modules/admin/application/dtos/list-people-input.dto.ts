import type { AdminRole } from '../../domain/types/admin-role.type';

export interface ListPeopleInputDto {
  readonly query: string;
  readonly role: AdminRole | null;
  readonly page: number;
}
