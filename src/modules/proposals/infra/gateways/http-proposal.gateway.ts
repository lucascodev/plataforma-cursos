import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http-client.interface';
import type { ProposalGateway } from '../../application/ports/proposal-gateway.interface';
import type { ProposalDraft } from '../../domain/entities/proposal-draft.entity';
import type { Proposal } from '../../domain/entities/proposal.entity';
import { PROPOSAL_API_PATHS } from '../constants/proposal-api-paths';
import { InvalidProposalResponseError } from '../errors/invalid-proposal-response.error';
import { mapProposalRecordToEntity } from '../mappers/proposal-record-to-entity.mapper';
import { proposalListResponseSchema } from '../schemas/proposal-list-response.schema';
import { proposalResponseSchema } from '../schemas/proposal-response.schema';

export class HttpProposalGateway implements ProposalGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async listMine(): Promise<Proposal[]> {
    const parsed = proposalListResponseSchema.safeParse(await this.httpClient.request({ path: PROPOSAL_API_PATHS.list }));
    if (!parsed.success) throw new InvalidProposalResponseError(PROPOSAL_API_PATHS.list, { cause: parsed.error });
    return parsed.data.proposals.map(mapProposalRecordToEntity);
  }

  async get(id: string): Promise<Proposal | null> {
    const path = PROPOSAL_API_PATHS.detail(id);
    try {
      return this.readOne(path, await this.httpClient.request({ path }));
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 404) return null;
      throw error;
    }
  }

  async submit(draft: ProposalDraft): Promise<Proposal> {
    return this.readOne(PROPOSAL_API_PATHS.list, await this.httpClient.request({ method: 'POST', path: PROPOSAL_API_PATHS.list, body: draft }));
  }

  async update(id: string, draft: ProposalDraft): Promise<Proposal> {
    const path = PROPOSAL_API_PATHS.detail(id);
    return this.readOne(path, await this.httpClient.request({ method: 'PUT', path, body: draft }));
  }

  async withdraw(id: string): Promise<void> {
    await this.httpClient.request({ method: 'POST', path: PROPOSAL_API_PATHS.withdraw(id) });
  }

  private readOne(path: string, body: unknown): Proposal {
    const parsed = proposalResponseSchema.safeParse(body);
    if (!parsed.success) throw new InvalidProposalResponseError(path, { cause: parsed.error });
    return mapProposalRecordToEntity(parsed.data.proposal);
  }
}
