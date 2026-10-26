export interface ProgressSummary {
  readonly courseSlug: string;
  readonly updatedAt: string;
  readonly completedItemIds: readonly string[];
  readonly studyDayCount: number;
}
