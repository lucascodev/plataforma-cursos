export interface VersionImpact {
  readonly students: number;
  /** Progress key of each removed lesson or drill -> how many people had completed it. */
  readonly completedRemoved: Readonly<Record<string, number>>;
}
