import type { AdminProposalStatus } from '../types/admin-proposal-status.type';
import type { PersonCard } from './people/person-card.entity';

export interface AdminProposal {
  readonly id: string;
  readonly status: AdminProposalStatus;
  readonly title: string;
  readonly summary: string;
  readonly audience: string;
  readonly area: string;
  readonly language: string;
  readonly outline: readonly string[];
  readonly experience: string;
  readonly sampleUrl: string | null;
  readonly suggestedSlug: string | null;
  readonly reviewNote: string | null;
  readonly reviewedAt: string | null;
  readonly courseSlug: string | null;
  readonly createdAt: string;
  readonly author: PersonCard | null;
}
