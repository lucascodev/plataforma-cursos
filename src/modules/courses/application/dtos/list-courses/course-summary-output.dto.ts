import type { CourseAuthor } from '../../../domain/entities/course/course-author.entity';
import type { CourseTaskText } from '../../../domain/entities/course/module/course-task-text.entity';
import type { StudyRhythm } from '../../../domain/entities/course/study-rhythm.entity';
import type { CourseTotals } from '../../../domain/entities/summary/course-totals.entity';
import type { CourseModuleSummaryOutputDto } from './course-module-summary-output.dto';

export interface CourseSummaryOutputDto {
  readonly slug: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly level: string;
  readonly audience: string;
  readonly version: string;
  readonly updatedAt: string;
  readonly rhythm: StudyRhythm;
  readonly kickoff: CourseTaskText;
  readonly author: CourseAuthor | null;
  readonly modules: readonly CourseModuleSummaryOutputDto[];
  readonly totals: CourseTotals;
}
