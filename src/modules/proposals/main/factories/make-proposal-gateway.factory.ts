import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import type { ProposalGateway } from '../../application/ports/proposal-gateway.interface';
import { HttpProposalGateway } from '../../infra/gateways/http-proposal.gateway';

export function makeProposalGateway(): ProposalGateway {
  return new HttpProposalGateway(makeHttpClient());
}
