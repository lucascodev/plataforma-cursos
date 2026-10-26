import type { ProposalDraft } from '../../domain/entities/proposal-draft.entity';
import type { Proposal } from '../../domain/entities/proposal.entity';

export interface ProposalGateway {
  listMine(): Promise<Proposal[]>;
  get(id: string): Promise<Proposal | null>;
  submit(draft: ProposalDraft): Promise<Proposal>;
  update(id: string, draft: ProposalDraft): Promise<Proposal>;
  withdraw(id: string): Promise<void>;
}
