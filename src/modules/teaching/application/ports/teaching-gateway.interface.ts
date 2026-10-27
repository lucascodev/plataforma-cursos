import type { CourseStats } from '../../domain/entities/course-stats.entity';
import type { CourseWorkspace } from '../../domain/entities/course-workspace.entity';
import type { LabCodes } from '../../domain/entities/lab-codes.entity';
import type { TeacherCourse } from '../../domain/entities/teacher-course.entity';
import type { CourseVersion } from '../../domain/entities/versions/course-version.entity';
import type { OpenVersion } from '../../domain/entities/versions/open-version.entity';
import type { ReviewItem } from '../../domain/entities/versions/review-item.entity';
import type { ResolveReviewItemInputDto } from '../dtos/resolve-review-item-input.dto';
import type { SaveDraftInputDto } from '../dtos/save-draft-input.dto';
import type { SetLabCodeInputDto } from '../dtos/set-lab-code-input.dto';
import type { SubmitVersionInputDto } from '../dtos/submit-version-input.dto';

export interface TeachingGateway {
  listCourses(): Promise<TeacherCourse[]>;
  getWorkspace(slug: string): Promise<CourseWorkspace | null>;
  getStats(slug: string): Promise<CourseStats>;
  openDraft(slug: string): Promise<OpenVersion>;
  /** Resolves to the new revision. Rejects with VersionConflictError when the draft changed elsewhere. */
  saveDraft(input: SaveDraftInputDto): Promise<number>;
  submitVersion(input: SubmitVersionInputDto): Promise<CourseVersion>;
  withdrawVersion(slug: string, versionId: string): Promise<CourseVersion>;
  resolveReviewItem(input: ResolveReviewItemInputDto): Promise<ReviewItem[]>;
  listLabCodes(slug: string): Promise<LabCodes>;
  setLabCode(input: SetLabCodeInputDto): Promise<void>;
}
