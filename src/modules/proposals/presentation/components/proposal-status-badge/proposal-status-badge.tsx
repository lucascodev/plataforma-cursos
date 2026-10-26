import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import type { ProposalStatus } from '../../../domain/types/proposal-status.type';
import { describeProposalStatus } from '../../formatters/describe-proposal-status';

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const description = describeProposalStatus(status);
  return <Badge tone={description.tone}>{description.label}</Badge>;
}
