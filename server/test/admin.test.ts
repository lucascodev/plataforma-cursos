import { describe, expect, it } from 'vitest';
import { handleApiMiddleware } from '../main/handle-api-middleware';
import { handleAdminApproveProposal } from '../modules/admin/handlers/handle-admin-approve-proposal';
import { handleAdminDeleteCourse } from '../modules/admin/handlers/handle-admin-delete-course';
import { handleAdminListAudit } from '../modules/admin/handlers/handle-admin-list-audit';
import { handleAdminListPeople } from '../modules/admin/handlers/handle-admin-list-people';
import { handleAdminOverview } from '../modules/admin/handlers/handle-admin-overview';
import { handleAdminReviewProposal } from '../modules/admin/handlers/handle-admin-review-proposal';
import { handleAdminSetRole } from '../modules/admin/handlers/handle-admin-set-role';
import { json, makeFakeServices, postgrestError, respondByPath } from './fake-supabase';
import { SITE, signedIn } from './test-requests';

const ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const overview = { people: { student: 3, teacher: 1, admin: 1 }, pendingProposals: 2, courses: { draft: 1, published: 1, unlisted: 0 }, activeStudents30d: 2 };

describe('admin', () => {
  it('quem não é admin recebe 403 sem o texto do Supabase', async () => {
    const { services } = makeFakeServices(() => postgrestError(403, '42501'));
    const response = await handleAdminOverview(signedIn('/api/admin/overview'), services);
    expect(response.status).toBe(403);
    expect(JSON.stringify(await response.json())).not.toContain('internal text');
  });

  it('visão geral passa pelo contrato', async () => {
    const { services, calls } = makeFakeServices(respondByPath({ 'rpc/admin_overview': () => json({ ...overview, secret: 'x' }) }));
    const body = (await (await handleAdminOverview(signedIn('/api/admin/overview'), services)).json()) as { overview: Record<string, unknown> };
    expect(calls[0]?.headers.authorization).toContain('Bearer ');
    expect(body.overview).toEqual(overview);
  });

  it('aprovar valida o endereço antes de chamar o banco', async () => {
    const { services, calls } = makeFakeServices(() => json({ courseSlug: 'x' }));
    const response = await handleAdminApproveProposal(
      signedIn(`/api/admin/proposals/${ID}/approve`, { method: 'POST', body: { slug: 'Com Espaço', note: '' } }),
      ID,
      services,
    );
    expect(response.status).toBe(422);
    expect(calls.length).toBe(0);
  });

  it('endereço em uso vira 409 em português', async () => {
    const { services, calls } = makeFakeServices(() => postgrestError(409, 'PT409', 'slug-taken'));
    const response = await handleAdminApproveProposal(
      signedIn(`/api/admin/proposals/${ID}/approve`, { method: 'POST', body: { slug: 'python', note: '' } }),
      ID,
      services,
    );
    expect(response.status).toBe(409);
    expect(calls[0]?.body).toEqual({ p_id: ID, p_slug: 'python', p_note: '' });
    expect(((await response.json()) as { error: { message: string } }).error.message).toContain('endereço');
  });

  it('pedir ajustes exige um motivo', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    const empty = await handleAdminReviewProposal(
      signedIn(`/api/admin/proposals/${ID}/request-changes`, { method: 'POST', body: { note: '  ' } }),
      ID,
      'changes_requested',
      services,
    );
    expect(empty.status).toBe(422);
    const ok = await handleAdminReviewProposal(
      signedIn(`/api/admin/proposals/${ID}/request-changes`, { method: 'POST', body: { note: 'Detalhe o projeto' } }),
      ID,
      'changes_requested',
      services,
    );
    expect(ok.status).toBe(204);
    expect(calls[0]?.body).toEqual({ p_id: ID, p_decision: 'changes_requested', p_note: 'Detalhe o projeto' });
  });

  it('último admin e curso com estudantes viram 409', async () => {
    const { services } = makeFakeServices(() => postgrestError(409, 'PT409', 'last-admin'));
    const role = await handleAdminSetRole(signedIn(`/api/admin/people/${ID}/role`, { method: 'PUT', body: { role: 'student' } }), ID, services);
    expect(role.status).toBe(409);

    const { services: courseServices } = makeFakeServices(() => postgrestError(409, 'PT409', 'course-has-students'));
    const deleted = await handleAdminDeleteCourse(signedIn('/api/admin/courses/a', { method: 'DELETE' }), 'a', courseServices);
    expect(deleted.status).toBe(409);
  });

  it('busca de pessoas manda o texto como parâmetro, nunca como filtro', async () => {
    const { services, calls } = makeFakeServices(() => json({ items: [], total: 0 }));
    await handleAdminListPeople(signedIn('/api/admin/people?q=ana%25&role=teacher&page=2'), services);
    expect(calls[0]?.url).toContain('/rest/v1/rpc/admin_list_people');
    expect(calls[0]?.body).toEqual({ p_query: 'ana%', p_role: 'teacher', p_limit: 50, p_offset: 50 });
  });

  it('histórico pagina pelo id', async () => {
    const { services, calls } = makeFakeServices(() => json({ items: [], nextBefore: null }));
    await handleAdminListAudit(signedIn('/api/admin/audit?before=120'), services);
    expect(calls[0]?.body).toEqual({ p_before: 120, p_limit: 50 });
  });

  it('token recusado pelo banco encerra a sessão', async () => {
    const { services } = makeFakeServices(() => json({ message: 'JWT expired' }, 401));
    const response = await handleAdminOverview(signedIn('/api/admin/overview'), services);
    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie().every((cookie) => cookie.includes('Max-Age=0'))).toBe(true);
  });

  it('escrita de outra origem na área admin é barrada antes do handler', async () => {
    let reached = false;
    const response = await handleApiMiddleware({
      request: new Request(`${SITE}/api/admin/people/${ID}/role`, { method: 'PUT', headers: { Origin: 'https://evil.example' } }),
      env: {},
      params: {},
      next: async () => {
        reached = true;
        return new Response(null, { status: 204 });
      },
    });
    expect(response.status).toBe(403);
    expect(reached).toBe(false);
  });
});
