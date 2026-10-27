import type { ProposalStatus } from '../types/proposal-status.type';
import type { ProposalDraft } from './proposal-draft.entity';

export interface Proposal extends ProposalDraft {
  readonly id: string;
  readonly status: ProposalStatus;
  readonly reviewNote: string | null;
  readonly reviewedAt: string | null;
  readonly courseSlug: string | null;
  readonly commitmentsAcceptedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
