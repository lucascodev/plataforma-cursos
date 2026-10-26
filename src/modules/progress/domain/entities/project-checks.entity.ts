export interface ProjectChecks {
  readonly requirements: Readonly<Record<string, true>>;
  readonly criteria: Readonly<Record<string, true>>;
}
