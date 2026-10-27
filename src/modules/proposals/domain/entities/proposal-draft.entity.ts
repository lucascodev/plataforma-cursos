import type { ProposalDuration } from '../types/proposal-duration.type';
import type { ProposalLevel } from '../types/proposal-level.type';

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
  readonly level: ProposalLevel | null;
  readonly duration: ProposalDuration | null;
  /** Open license, free for students, every version reviewed. */
  readonly commitmentsAccepted: boolean;
}
