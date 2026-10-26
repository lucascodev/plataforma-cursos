import type { CourseTotals } from '../../../domain/entities/summary/course-totals.entity';

export interface CourseSummaryOutputDto {
  readonly slug: string;
  readonly title: string;
  readonly tagline: string;
  readonly level: string;
  readonly audience: string;
  readonly totals: CourseTotals;
}
