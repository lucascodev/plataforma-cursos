import type { PersonCard } from './person-card.entity';

export interface AdminPerson extends PersonCard {
  readonly createdAt: string;
  readonly coursesOwned: number;
}
