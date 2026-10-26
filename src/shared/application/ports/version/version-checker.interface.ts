export interface VersionChecker {
  currentBuildId(): string;
  /** Null when the published version cannot be read right now. */
  publishedBuildId(): Promise<string | null>;
}
