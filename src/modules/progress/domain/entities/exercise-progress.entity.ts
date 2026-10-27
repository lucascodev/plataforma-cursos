export interface ExerciseProgress {
  readonly stepsDone: readonly string[];
  /** Positions of the done criteria the person checked. */
  readonly criteriaDone: readonly number[];
  /** Quiz: question id -> chosen option id. */
  readonly answers: Readonly<Record<string, string>>;
  readonly attempts: number;
  readonly passedChecks: readonly string[];
  readonly hintsOpened: number;
  readonly code: string | null;
  readonly files: Readonly<Record<string, string>>;
  readonly deliveryUrl: string | null;
  readonly deliveryText: string;
  readonly completedAt: string | null;
}
