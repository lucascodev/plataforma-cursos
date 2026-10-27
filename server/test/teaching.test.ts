import { describe, expect, it } from 'vitest';
import { handleAdminPublishVersion } from '../modules/admin/handlers/versions/handle-admin-publish-version';
import { handleDeleteAccount } from '../modules/auth/handlers/handle-delete-account';
import { handleLogout } from '../modules/auth/handlers/handle-logout';
import { handleListCourseReleases } from '../modules/courses/handlers/handle-list-course-releases';
import { handleReportTeacher } from '../modules/profiles/handlers/handle-report-teacher';
import { handleGetCourseStats } from '../modules/teaching/handlers/courses/handle-get-course-stats';
import { handleSaveDraft } from '../modules/teaching/handlers/drafts/handle-save-draft';
import { handleSubmitVersion } from '../modules/teaching/handlers/drafts/handle-submit-version';
import { json, makeFakeServices, postgrestError, respondByPath } from './fakes/fake-supabase';
import { signedIn } from './fakes/test-requests';
import { VALID_COURSE } from './fakes/valid-course';

const VERSION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const TIMESTAMP = '2027-01-11T12:00:00+00:00';

const version = (overrides: Record<string, unknown> = {}) => ({
  id: VERSION_ID,
  courseSlug: 'curso',
  status: 'draft',
  semver: null,
  kind: null,
  revision: 3,
  submitMessage: null,
  reviewItems: [],
  releaseNote: null,
  basedOnSemver: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  submittedAt: null,
  reviewedAt: null,
  publishedAt: null,
  ...overrides,
});

const workspace = (content: Record<string, unknown>) => ({
  course: { slug: 'curso', published: false, listed: true },
  publishedVersion: null,
  openVersion: { ...version(), content },
});

const submitRequest = (revision = 3) =>
  signedIn('/api/teaching/courses/curso/submit', { method: 'POST', body: { versionId: VERSION_ID, revision, kind: 'minor', message: '' } });

describe('área do professor', () => {
  it('salvar recusa rascunho de outro curso sem chamar o banco', async () => {
    const { services, calls } = makeFakeServices(() => json(4));
    const response = await handleSaveDraft(
      signedIn('/api/teaching/courses/curso/draft', { method: 'PUT', body: { versionId: VERSION_ID, revision: 3, content: { slug: 'outro' } } }),
      'curso',
      services,
    );
    expect(response.status).toBe(422);
    expect(calls).toHaveLength(0);
  });

  it('salvar devolve a nova revisão e conflito vira 409 em português', async () => {
    const { services, calls } = makeFakeServices(() => json(4));
    const body = { versionId: VERSION_ID, revision: 3, content: { slug: 'curso', title: 'Rascunho' } };
    const saved = await handleSaveDraft(signedIn('/api/teaching/courses/curso/draft', { method: 'PUT', body }), 'curso', services);
    expect(await saved.json()).toEqual({ revision: 4 });
    expect(calls[0]?.body).toEqual({ p_id: VERSION_ID, p_content: body.content, p_revision: 3 });

    const { services: stale } = makeFakeServices(() => postgrestError(409, 'PT409', 'version-conflict'));
    const conflict = await handleSaveDraft(signedIn('/api/teaching/courses/curso/draft', { method: 'PUT', body }), 'curso', stale);
    expect(conflict.status).toBe(409);
    expect(((await conflict.json()) as { error: { message: string } }).error.message).toContain('outra aba');
  });

  it('enviar com curso incompleto devolve as verificações e não chama o envio', async () => {
    const { services, calls } = makeFakeServices(
      respondByPath({ 'rpc/teacher_get_open_version': () => json(workspace({ slug: 'curso', title: 'Curso' })) }),
    );
    const response = await handleSubmitVersion(submitRequest(), 'curso', services);
    expect(response.status).toBe(422);
    const body = (await response.json()) as { error: { code: string; checks: { where: string }[] } };
    expect(body.error.code).toBe('course-invalid');
    expect(body.error.checks.some((check) => check.where === 'Descrição')).toBe(true);
    expect(calls.map((call) => call.url)).not.toContain(expect.stringContaining('teacher_submit_version'));
  });

  it('enviar com revisão velha vira conflito antes de validar', async () => {
    const { services } = makeFakeServices(respondByPath({ 'rpc/teacher_get_open_version': () => json(workspace(VALID_COURSE)) }));
    expect((await handleSubmitVersion(submitRequest(2), 'curso', services)).status).toBe(409);
  });

  it('enviar curso válido chama o banco com a revisão conferida', async () => {
    const { services, calls } = makeFakeServices(
      respondByPath({
        'rpc/teacher_get_open_version': () => json(workspace(VALID_COURSE)),
        'rpc/teacher_submit_version': () => json(version({ status: 'in_review', semver: '1.0.0', kind: 'first', revision: 4 })),
      }),
    );
    const response = await handleSubmitVersion(submitRequest(), 'curso', services);
    expect(response.status).toBe(200);
    expect(calls[1]?.body).toEqual({ p_id: VERSION_ID, p_kind: 'minor', p_message: '', p_revision: 3 });
  });

  it('números passam pelo contrato: contagem pequena chega como null', async () => {
    const stats = { students: null, active7d: null, projectsDelivered: null, completed: null, modules: [] };
    const { services } = makeFakeServices(() => json(stats));
    const response = await handleGetCourseStats(signedIn('/api/teaching/courses/curso/stats'), 'curso', services);
    expect(await response.json()).toEqual({ stats });

    const { services: leaky } = makeFakeServices(() => json({ ...stats, students: 3 }));
    expect((await handleGetCourseStats(signedIn('/api/teaching/courses/curso/stats'), 'curso', leaky)).status).toBe(502);
  });
});

describe('publicar versão', () => {
  const detail = (content: Record<string, unknown>) => ({
    version: { ...version({ status: 'in_review', semver: '1.0.0', kind: 'first', revision: 5 }), content },
    course: { slug: 'curso', title: 'Curso', published: false, owner: null, studentCount: 0 },
    publishedContent: null,
  });
  const publishRequest = (revision = 5) =>
    signedIn(`/api/admin/versions/${VERSION_ID}/publish`, { method: 'POST', body: { revision, releaseNote: 'Primeira versão' } });

  it('valida o conteúdo de novo antes de publicar', async () => {
    const { services, calls } = makeFakeServices(respondByPath({ 'rpc/admin_get_version': () => json(detail({ slug: 'curso' })) }));
    expect((await handleAdminPublishVersion(publishRequest(), VERSION_ID, services)).status).toBe(422);
    expect(calls).toHaveLength(1);
  });

  it('publica a revisão que foi validada', async () => {
    const { services, calls } = makeFakeServices(
      respondByPath({
        'rpc/admin_get_version': () => json(detail(VALID_COURSE)),
        'rpc/admin_publish_version': () => json(version({ status: 'published', semver: '1.0.0', kind: 'first', revision: 6 })),
      }),
    );
    expect((await handleAdminPublishVersion(publishRequest(), VERSION_ID, services)).status).toBe(200);
    expect(calls[1]?.body).toEqual({ p_id: VERSION_ID, p_release_note: 'Primeira versão', p_revision: 5 });
    expect((await handleAdminPublishVersion(publishRequest(4), VERSION_ID, services)).status).toBe(409);
  });
});

describe('conta e perfis', () => {
  it('excluir a conta apaga os cookies da sessão', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    const response = await handleDeleteAccount(signedIn('/api/me', { method: 'DELETE' }), services);
    expect(response.status).toBe(204);
    expect(calls[0]?.url).toContain('rpc/delete_my_account');
    expect(response.headers.get('Set-Cookie')).toContain('Max-Age=0');
  });

  it('dona de curso não exclui a conta e a sessão continua', async () => {
    const { services } = makeFakeServices(() => postgrestError(409, 'PT409', 'owns-courses'));
    const response = await handleDeleteAccount(signedIn('/api/me', { method: 'DELETE' }), services);
    expect(response.status).toBe(409);
    expect(response.headers.get('Set-Cookie')).toBeNull();
  });

  it('sair de todos os aparelhos pede o escopo global', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    await handleLogout(signedIn('/api/auth/logout-everywhere', { method: 'POST' }), services, 'global');
    expect(calls.at(-1)?.url).toContain('scope=global');
  });

  it('avisar sobre um perfil valida o motivo', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    const invalid = await handleReportTeacher(
      signedIn('/api/teachers/ana/report', { method: 'POST', body: { reason: 'spam', details: '' } }),
      'ana',
      services,
    );
    expect(invalid.status).toBe(422);
    const ok = await handleReportTeacher(
      signedIn('/api/teachers/ana/report', { method: 'POST', body: { reason: 'other', details: 'Link quebrado' } }),
      'ana',
      services,
    );
    expect(ok.status).toBe(204);
    expect(calls[0]?.body).toEqual({ p_handle: 'ana', p_reason: 'other', p_details: 'Link quebrado' });
  });

  it('histórico público de versões tem cache e passa pelo contrato', async () => {
    const releases = [{ semver: '1.0.0', kind: 'first', releaseNote: null, publishedAt: TIMESTAMP }];
    const { services } = makeFakeServices(() => json(releases));
    const response = await handleListCourseReleases('curso', services);
    expect(response.headers.get('Cache-Control')).toContain('public');
    expect(await response.json()).toEqual({ releases });
  });
});
