import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http/http-request.type';
import { InvalidProposalResponseError } from '../errors/invalid-proposal-response.error';
import { HttpProposalGateway } from './http-proposal.gateway';

function gatewayWith(answer: (request: HttpRequest) => unknown) {
  const requests: HttpRequest[] = [];
  const client: HttpClient = {
    async request(request) {
      requests.push(request);
      return answer(request);
    },
  };
  return { gateway: new HttpProposalGateway(client), requests };
}

const ID = '3f1c2a1e-5b6d-4c7e-8f90-1a2b3c4d5e6f';
const draft = {
  title: 'Python do zero',
  summary: 'Curso prático.',
  audience: 'Iniciantes',
  area: 'Programação',
  language: 'pt-BR',
  outline: ['Básico'],
  experience: '',
  sampleUrl: null,
  suggestedSlug: null,
};
const record = { ...draft, id: ID, status: 'pending', reviewNote: null, reviewedAt: null, courseSlug: null, createdAt: '2026-11-02', updatedAt: '2026-11-02' };

describe('HttpProposalGateway', () => {
  it('submits, updates and withdraws through the proposal routes', async () => {
    const { gateway, requests } = gatewayWith((request) => (request.path.endsWith('/withdraw') ? null : { proposal: record }));
    expect((await gateway.submit(draft)).id).toBe(ID);
    await gateway.update(ID, draft);
    await gateway.withdraw(ID);
    expect(requests).toEqual([
      { method: 'POST', path: '/api/proposals', body: draft },
      { method: 'PUT', path: `/api/proposals/${ID}`, body: draft },
      { method: 'POST', path: `/api/proposals/${ID}/withdraw` },
    ]);
  });

  it('returns null for a proposal that is not visible', async () => {
    const { gateway } = gatewayWith(() => {
      throw new HttpRequestError(404);
    });
    expect(await gateway.get(ID)).toBeNull();
  });

  it('refuses an unexpected list', async () => {
    await expect(gatewayWith(() => ({ proposals: [{ id: 'x' }] })).gateway.listMine()).rejects.toThrow(InvalidProposalResponseError);
  });
});
