import type { PeopleFilter } from '../../domain/types/people-filter.type';

export interface ListPeopleInputDto {
  readonly query: string;
  readonly role: PeopleFilter | null;
  readonly page: number;
}
