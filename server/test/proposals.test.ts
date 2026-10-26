import { describe, expect, it } from 'vitest';
import { handleCreateProposal } from '../modules/proposals/handlers/handle-create-proposal';
import { handleGetProposal } from '../modules/proposals/handlers/handle-get-proposal';
import { handleUpdateProposal } from '../modules/proposals/handlers/handle-update-proposal';
import { handleWithdrawProposal } from '../modules/proposals/handlers/handle-withdraw-proposal';
import { json, makeFakeServices, postgrestError } from './fakes/fake-supabase';
import { signedIn, signedOut } from './fakes/test-requests';

const ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const input = {
  title: 'Python do zero',
  summary: 'Curso prático.',
  audience: 'Iniciantes',
  area: 'Programação',
  language: 'pt-BR',
  outline: ['Básico', 'Projeto'],
  experience: '',
  sampleUrl: null,
  suggestedSlug: 'python-do-zero',
};
const row = {
  ...input,
  id: ID,
  status: 'pending',
  reviewNote: null,
  reviewedAt: null,
  courseSlug: null,
  createdAt: '2026-11-02T12:00:00+00:00',
  updatedAt: '2026-11-02T12:00:00+00:00',
};

describe('propostas', () => {
  it('enviar exige sessão', async () => {
    const { services, calls } = makeFakeServices(() => json([row], 201));
    expect((await handleCreateProposal(signedOut('/api/proposals', { method: 'POST', body: input }), services)).status).toBe(401);
    expect(calls.length).toBe(0);
  });

  it('envia só as colunas de conteúdo, em nome da pessoa', async () => {
    const { services, calls } = makeFakeServices(() => json([row], 201));
    const response = await handleCreateProposal(signedIn('/api/proposals', { method: 'POST', body: { ...input, status: 'approved' } }), services);
    expect(response.status).toBe(201);
    expect(calls[0]?.headers.authorization).toContain('Bearer ');
    expect(calls[0]?.body).toEqual({
      title: 'Python do zero',
      summary: 'Curso prático.',
      audience: 'Iniciantes',
      area: 'Programação',
      language: 'pt-BR',
      outline: ['Básico', 'Projeto'],
      experience: '',
      sample_url: null,
      suggested_slug: 'python-do-zero',
    });
  });

  it('limite de propostas abertas vira mensagem clara', async () => {
    const { services } = makeFakeServices(() => postgrestError(409, 'PT409', 'too-many-open-proposals'));
    const response = await handleCreateProposal(signedIn('/api/proposals', { method: 'POST', body: input }), services);
    expect(response.status).toBe(409);
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('too-many-open-proposals');
  });

  it('corpo grande demais responde 413', async () => {
    const { services, calls } = makeFakeServices(() => json([row]));
    const response = await handleCreateProposal(signedIn('/api/proposals', { method: 'POST', body: { ...input, summary: 'x'.repeat(40_000) } }), services);
    expect(response.status).toBe(413);
    expect(calls.length).toBe(0);
  });

  it('id inválido responde 404 sem consultar o banco', async () => {
    const { services, calls } = makeFakeServices(() => json([]));
    expect((await handleGetProposal(signedIn('/api/proposals/x'), "1' or '1'='1", services)).status).toBe(404);
    expect(calls.length).toBe(0);
  });

  it('editar proposta fechada responde 409', async () => {
    const { services } = makeFakeServices(() => json([]));
    const response = await handleUpdateProposal(signedIn(`/api/proposals/${ID}`, { method: 'PUT', body: input }), ID, services);
    expect(response.status).toBe(409);
  });

  it('retirar chama a função do banco com o token', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    const response = await handleWithdrawProposal(signedIn(`/api/proposals/${ID}/withdraw`, { method: 'POST' }), ID, services);
    expect(response.status).toBe(204);
    expect(calls[0]?.url).toContain('/rest/v1/rpc/withdraw_proposal');
    expect(calls[0]?.body).toEqual({ p_id: ID });
  });
});
