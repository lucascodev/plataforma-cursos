import type { AdminProposalStatus } from '../../domain/types/admin-proposal-status.type';

export interface ListProposalsInputDto {
  readonly status: AdminProposalStatus | null;
  readonly page: number;
}
