import type { UnlistReason } from '../../domain/types/unlist-reason.type';

export interface SetCourseListedInputDto {
  readonly slug: string;
  readonly listed: boolean;
  readonly reason: UnlistReason | null;
  readonly note: string;
}
