import type { EditableCourse } from '../../domain/entities/draft/editable-course.entity';

export interface SaveDraftInputDto {
  readonly slug: string;
  readonly versionId: string;
  readonly revision: number;
  readonly content: EditableCourse;
}
