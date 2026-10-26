import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http-request.type';
import { InvalidAdminResponseError } from '../errors/invalid-admin-response.error';
import { HttpAdminGateway } from './http-admin.gateway';

function gatewayWith(answer: (request: HttpRequest) => unknown) {
  const requests: HttpRequest[] = [];
  const client: HttpClient = {
    async request(request) {
      requests.push(request);
      return answer(request);
    },
  };
  return { gateway: new HttpAdminGateway(client), requests };
}

const ID = '3f1c2a1e-5b6d-4c7e-8f90-1a2b3c4d5e6f';

describe('HttpAdminGateway', () => {
  it('sends filters as query parameters and skips empty ones', async () => {
    const { gateway, requests } = gatewayWith(() => ({ items: [], total: 0 }));
    await gateway.listPeople({ query: ' ana ', role: 'teacher', page: 2 });
    await gateway.listPeople({ query: '', role: null, page: 1 });
    await gateway.listProposals({ status: 'pending', page: 1 });
    expect(requests.map((request) => request.path)).toEqual([
      '/api/admin/people?q=ana&role=teacher&page=2',
      '/api/admin/people',
      '/api/admin/proposals?status=pending',
    ]);
  });

  it('approves with slug and note, and routes the other decisions', async () => {
    const { gateway, requests } = gatewayWith((request) => (request.path.endsWith('/approve') ? { courseSlug: 'python' } : null));
    expect(await gateway.approveProposal({ id: ID, slug: 'python', note: '' })).toEqual({ courseSlug: 'python' });
    await gateway.decideProposal({ id: ID, decision: 'refused', note: 'Fora do escopo' });
    await gateway.decideProposal({ id: ID, decision: 'changes_requested', note: 'Detalhe o projeto' });
    expect(requests.map((request) => [request.method, request.path])).toEqual([
      ['POST', `/api/admin/proposals/${ID}/approve`],
      ['POST', `/api/admin/proposals/${ID}/refuse`],
      ['POST', `/api/admin/proposals/${ID}/request-changes`],
    ]);
  });

  it('turns a missing proposal into null and refuses unexpected answers', async () => {
    const missing = gatewayWith(() => {
      throw new HttpRequestError(404);
    });
    expect(await missing.gateway.getProposal(ID)).toBeNull();
    await expect(gatewayWith(() => ({ overview: { people: 3 } })).gateway.getOverview()).rejects.toThrow(InvalidAdminResponseError);
  });

  it('pages the history by id', async () => {
    const { gateway, requests } = gatewayWith(() => ({ items: [], nextBefore: null }));
    await gateway.listAudit(120);
    expect(requests[0]?.path).toBe('/api/admin/audit?before=120');
  });
});
