export interface ProposalDraft {
  readonly title: string;
  readonly summary: string;
  readonly audience: string;
  readonly area: string;
  readonly language: string;
  readonly outline: readonly string[];
  readonly experience: string;
  readonly sampleUrl: string | null;
  readonly suggestedSlug: string | null;
}
