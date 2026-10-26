export interface AdminOverview {
  readonly people: { readonly student: number; readonly teacher: number; readonly admin: number };
  readonly pendingProposals: number;
  readonly courses: { readonly draft: number; readonly published: number; readonly unlisted: number };
  readonly activeStudents30d: number;
}
