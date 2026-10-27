// Every count is null when fewer than 5 people would be behind it.
export interface CourseStats {
  readonly students: number | null;
  readonly active7d: number | null;
  readonly projectsDelivered: number | null;
  readonly completed: number | null;
  readonly modules: readonly { readonly moduleId: string; readonly shortTitle: string; readonly people: number | null }[];
}
