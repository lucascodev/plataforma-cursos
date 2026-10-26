export interface StudyCourseSummary {
  readonly slug: string;
  readonly title: string;
  readonly percent: number;
  readonly completedItems: number;
  readonly totalItems: number;
  readonly projectsDone: number;
  readonly studyDays: number;
  readonly updatedAt: string;
}
