import type { PersonCard } from './people/person-card.entity';

export interface AdminCourse {
  readonly slug: string;
  readonly title: string;
  readonly version: string | null;
  readonly published: boolean;
  readonly listed: boolean;
  readonly owner: PersonCard | null;
  readonly studentCount: number;
  readonly updatedAt: string;
}
