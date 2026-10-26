import type { CourseGuide } from '../guide/course-guide.entity';
import type { CourseAuthor } from './course-author.entity';
import type { CourseModule } from './module/course-module.entity';
import type { CourseTaskText } from './module/course-task-text.entity';
import type { StudyRhythm } from './study-rhythm.entity';
import type { SundayTrack } from './sunday-track/sunday-track.entity';

export interface Course {
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
  readonly sundayTrack: SundayTrack | null;
  readonly modules: readonly CourseModule[];
  readonly guide: CourseGuide;
  readonly author: CourseAuthor | null;
}
