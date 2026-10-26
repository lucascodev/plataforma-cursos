export interface DecideProposalInputDto {
  readonly id: string;
  readonly decision: 'changes_requested' | 'refused';
  readonly note: string;
}
