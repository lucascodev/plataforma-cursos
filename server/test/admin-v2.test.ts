import { describe, expect, it } from 'vitest';
import { handleAdminListAudit } from '../modules/admin/handlers/handle-admin-list-audit';
import { handleAdminNavBadges } from '../modules/admin/handlers/handle-admin-nav-badges';
import { handleAdminListCourses } from '../modules/admin/handlers/courses/handle-admin-list-courses';
import { handleAdminSetCourseListing } from '../modules/admin/handlers/courses/handle-admin-set-course-listing';
import { handleAdminSetBlocked } from '../modules/admin/handlers/people/handle-admin-set-blocked';
import { handleAdminVersionImpact } from '../modules/admin/handlers/versions/handle-admin-version-impact';
import { handleCreateProposal } from '../modules/proposals/handlers/handle-create-proposal';
import { json, makeFakeServices, postgrestError, respondByPath } from './fakes/fake-supabase';
import { signedIn } from './fakes/test-requests';

const ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const TIMESTAMP = '2027-01-11T12:00:00+00:00';

describe('admin: filtros', () => {
  it('cursos repassam busca e situação, e ignoram situação desconhecida', async () => {
    const { services, calls } = makeFakeServices(() => json([]));
    await handleAdminListCourses(signedIn('/api/admin/courses?q=%20ana%20&status=review'), services);
    await handleAdminListCourses(signedIn('/api/admin/courses?status=apagado'), services);
    expect(calls.map((call) => call.body)).toEqual([
      { p_query: 'ana', p_status: 'review' },
      { p_query: null, p_status: null },
    ]);
  });

  it('histórico repassa o tipo', async () => {
    const { services, calls } = makeFakeServices(() => json({ items: [], nextBefore: null }));
    await handleAdminListAudit(signedIn('/api/admin/audit?kind=people&before=10'), services);
    expect(calls[0]?.body).toEqual({ p_before: 10, p_limit: 50, p_kind: 'people' });
  });

  it('tirar do catálogo leva motivo e nota', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    const response = await handleAdminSetCourseListing(
      signedIn('/api/admin/courses/curso/listing', { method: 'PUT', body: { listed: false, reason: 'outdated', note: ' Links quebrados ' } }),
      'curso',
      services,
    );
    expect(response.status).toBe(204);
    expect(calls[0]?.body).toEqual({ p_slug: 'curso', p_listed: false, p_reason: 'outdated', p_note: 'Links quebrados' });
  });

  it('contadores do menu passam pelo contrato', async () => {
    const badges = { pendingProposals: 2, versionsInReview: 1, openReports: 0 };
    const { services } = makeFakeServices(() => json(badges));
    expect(await (await handleAdminNavBadges(signedIn('/api/admin/badges'), services)).json()).toEqual({ badges });
  });
});

describe('admin: contas e versões', () => {
  it('bloquear exige o corpo certo e mostra a regra em português', async () => {
    const { services, calls } = makeFakeServices(() => postgrestError(409, 'PT409', 'cannot-block-admin'));
    const invalid = await handleAdminSetBlocked(signedIn(`/api/admin/people/${ID}/block`, { method: 'PUT', body: { blocked: 'sim' } }), ID, services);
    expect(invalid.status).toBe(422);
    expect(calls).toHaveLength(0);
    const refused = await handleAdminSetBlocked(signedIn(`/api/admin/people/${ID}/block`, { method: 'PUT', body: { blocked: true } }), ID, services);
    expect(refused.status).toBe(409);
    expect(((await refused.json()) as { error: { message: string } }).error.message).toContain('admin');
  });

  it('impacto da versão calcula no servidor quais aulas saem', async () => {
    const lesson = (id: string) => ({ id, title: 'Aula', summary: 'R', exercise: 'E' });
    const detail = {
      version: {
        id: ID,
        courseSlug: 'curso',
        status: 'in_review',
        semver: '1.1.0',
        kind: 'minor',
        revision: 3,
        submitMessage: null,
        reviewItems: [],
        releaseNote: null,
        basedOnSemver: '1.0.0',
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP,
        submittedAt: TIMESTAMP,
        reviewedAt: null,
        publishedAt: null,
        content: { slug: 'curso', modules: [{ id: 'm1', lessons: [lesson('t0')] }] },
      },
      course: { slug: 'curso', title: 'Curso', published: true, owner: null, studentCount: 9 },
      publishedContent: { slug: 'curso', modules: [{ id: 'm1', lessons: [lesson('t0'), lesson('t1')] }] },
    };
    const { services, calls } = makeFakeServices(
      respondByPath({
        'rpc/admin_get_version': () => json(detail),
        'rpc/admin_version_impact': () => json({ students: 9, completedRemoved: { 'm1-t1': 4 } }),
      }),
    );
    const response = await handleAdminVersionImpact(signedIn(`/api/admin/versions/${ID}/impact`), ID, services);
    expect(await response.json()).toEqual({ impact: { students: 9, completedRemoved: { 'm1-t1': 4 } } });
    expect(calls[1]?.body).toEqual({ p_id: ID, p_keys: ['m1-t1'] });
  });

  it('conta bloqueada recebe uma mensagem clara em qualquer escrita', async () => {
    const { services } = makeFakeServices(() => postgrestError(403, '42501', 'account-blocked'));
    const body = { title: 'Curso', summary: 'R', audience: 'T', area: 'D', language: 'pt-BR', outline: ['Um'], experience: '', sampleUrl: null, suggestedSlug: null };
    const response = await handleCreateProposal(signedIn('/api/proposals', { method: 'POST', body }), services);
    expect(response.status).toBe(403);
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('account-blocked');
  });
});
