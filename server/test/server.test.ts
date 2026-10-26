import { describe, expect, it } from 'vitest';
import { handleApiMiddleware } from '../main/middleware/handle-api-middleware';
import { handleCallback } from '../modules/auth/handlers/handle-callback';
import { handleLogin } from '../modules/auth/handlers/handle-login';
import { handleLogout } from '../modules/auth/handlers/handle-logout';
import { handleMe } from '../modules/auth/handlers/handle-me';
import { resolveSession } from '../modules/auth/session/resolve-session';
import { sanitizeReturnPath } from '../modules/auth/sanitize-return-path';
import { handleGetCourse } from '../modules/courses/handlers/handle-get-course';
import { handleListCourses } from '../modules/courses/handlers/handle-list-courses';
import { handleDeleteProgress } from '../modules/progress/handlers/handle-delete-progress';
import { handleGetProgress } from '../modules/progress/handlers/handle-get-progress';
import { handlePutProgress } from '../modules/progress/handlers/handle-put-progress';
import { readServerConfig } from '../shared/env/read-server-config';
import { isSameOriginRequest } from '../shared/http/is-same-origin-request';
import { parseCookies } from '../shared/http/cookies/parse-cookies';
import { accessToken, fakeJwt, json, makeFakeServices, respondByPath } from './fakes/fake-supabase';

const SITE = 'https://cursos.exemplo.dev';
const setCookies = (response: Response) => response.headers.getSetCookie();
const cookieHeader = (pairs: Record<string, string>) =>
  Object.entries(pairs)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
const emptyProgress = { completedItems: {}, studyDays: {}, moduleNotes: {}, journal: {}, startDate: '2026-10-26', startDateSource: 'user', updatedAt: null };

describe('configuração do servidor', () => {
  it('recusa chave secreta, falta de variáveis e http', () => {
    expect(() => readServerConfig({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_secret_abc' })).toThrow();
    expect(() => readServerConfig({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_PUBLISHABLE_KEY: fakeJwt({ role: 'service_role' }) })).toThrow();
    expect(() => readServerConfig({ SUPABASE_URL: 'http://x.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_a' })).toThrow();
    expect(() => readServerConfig({})).toThrow();
    expect(readServerConfig({ SUPABASE_URL: 'https://x.supabase.co/', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_a' }).supabaseUrl).toBe('https://x.supabase.co');
  });
});

describe('proteções de requisição', () => {
  it('aceita só caminhos internos na volta do login', () => {
    expect(sanitizeReturnPath('/cursos/engenharia-de-ia')).toBe('/cursos/engenharia-de-ia');
    expect(sanitizeReturnPath('//evil.example')).toBe('/');
    expect(sanitizeReturnPath('https://evil.example')).toBe('/');
    expect(sanitizeReturnPath('/a?next=https://evil')).toBe('/');
    expect(sanitizeReturnPath(null)).toBe('/');
  });

  it('recusa escrita vinda de outro site', () => {
    const post = (headers: Record<string, string>) => new Request(`${SITE}/api/progress/x`, { method: 'PUT', headers });
    expect(isSameOriginRequest(post({ Origin: SITE }))).toBe(true);
    expect(isSameOriginRequest(post({ Origin: 'https://evil.example' }))).toBe(false);
    expect(isSameOriginRequest(post({}))).toBe(false);
    expect(isSameOriginRequest(new Request(`${SITE}/api/me`))).toBe(true);
    expect(isSameOriginRequest(post({ 'Sec-Fetch-Site': 'same-origin' }))).toBe(true);
    expect(isSameOriginRequest(post({ 'Sec-Fetch-Site': 'cross-site', Origin: SITE }))).toBe(false);
    expect(isSameOriginRequest(post({ 'Sec-Fetch-Site': 'same-site' }))).toBe(false);
  });

  it('middleware devolve 403 para escrita de outra origem e põe cabeçalhos de segurança', async () => {
    const context = {
      request: new Request(`${SITE}/api/progress/x`, { method: 'DELETE', headers: { Origin: 'https://evil.example' } }),
      env: {},
      params: {},
      next: async () => new Response('não devia chegar aqui'),
    };
    const response = await handleApiMiddleware(context);
    expect(response.status).toBe(403);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rota ou método sem function responde 404 em JSON, não o index.html', async () => {
    const context = {
      request: new Request(`${SITE}/api/nao-existe`),
      env: {},
      params: {},
      next: async () => new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    };
    const response = await handleApiMiddleware(context);
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
  });

  it('middleware transforma erro inesperado em 500 sem vazar detalhes', async () => {
    const context = {
      request: new Request(`${SITE}/api/me`),
      env: {},
      params: {},
      next: async () => {
        throw new Error('segredo interno');
      },
    };
    const response = await handleApiMiddleware(context);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('segredo');
  });
});

describe('login com PKCE', () => {
  it('redireciona ao Supabase e guarda o verificador em cookie HttpOnly', async () => {
    const { services } = makeFakeServices(() => json({}));
    const response = await handleLogin(new Request(`${SITE}/api/auth/login?returnTo=/cursos/engenharia-de-ia`), services);
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get('Location') ?? '');
    expect(location.origin).toBe('https://projeto.supabase.co');
    expect(location.searchParams.get('provider')).toBe('github');
    expect(location.searchParams.get('code_challenge_method')).toBe('s256');
    expect(location.searchParams.get('redirect_to')).toBe(`${SITE}/api/auth/callback`);
    const cookies = setCookies(response);
    expect(cookies.length).toBe(2);
    for (const cookie of cookies) {
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
      expect(cookie.startsWith('__Host-')).toBe(true);
    }
    expect(cookies.join(' ')).toContain(encodeURIComponent('/cursos/engenharia-de-ia'));
  });

  it('troca o código pela sessão e grava os tokens só em cookies', async () => {
    const tokens = { access_token: accessToken(), refresh_token: 'refresh-1', expires_in: 3600 };
    const { services, calls } = makeFakeServices(() => json(tokens));
    const request = new Request(`${SITE}/api/auth/callback?code=abc`, {
      headers: { Cookie: cookieHeader({ '__Host-ca-verifier': 'verificador', '__Host-ca-return': '/cursos/engenharia-de-ia' }) },
    });
    const response = await handleCallback(request, services);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/cursos/engenharia-de-ia');
    expect(calls[0]?.url).toContain('grant_type=pkce');
    expect(calls[0]?.body).toEqual({ auth_code: 'abc', code_verifier: 'verificador' });
    const cookies = setCookies(response).join('\n');
    expect(cookies).toContain('__Host-ca-access=');
    expect(cookies).toContain('__Host-ca-refresh=refresh-1');
    expect(await response.text()).toBe('');
  });

  it('volta para a tela de entrar se o verificador sumiu ou o GitHub recusou', async () => {
    const { services, calls } = makeFakeServices(() => json({}));
    const semVerificador = await handleCallback(new Request(`${SITE}/api/auth/callback?code=abc`), services);
    expect(semVerificador.headers.get('Location')).toBe('/entrar?erro=login');
    const recusado = await handleCallback(
      new Request(`${SITE}/api/auth/callback?error=access_denied`, { headers: { Cookie: cookieHeader({ '__Host-ca-verifier': 'v' }) } }),
      services,
    );
    expect(recusado.headers.get('Location')).toBe('/entrar?erro=login');
    expect(calls.length).toBe(0);
  });
});

describe('sessão', () => {
  it('usa o token de acesso válido sem chamar o Supabase', async () => {
    const { services, calls } = makeFakeServices(() => json({}));
    const session = await resolveSession(new Request(SITE, { headers: { Cookie: cookieHeader({ '__Host-ca-access': accessToken() }) } }), services);
    expect(session?.userId).toBe('user-1');
    expect(session?.cookies.length).toBe(0);
    expect(calls.length).toBe(0);
  });

  it('renova o token vencido e devolve cookies novos', async () => {
    const { services, calls } = makeFakeServices(() => json({ access_token: accessToken(), refresh_token: 'refresh-2', expires_in: 3600 }));
    const request = new Request(SITE, { headers: { Cookie: cookieHeader({ '__Host-ca-access': accessToken(-10), '__Host-ca-refresh': 'refresh-1' }) } });
    const session = await resolveSession(request, services);
    expect(calls[0]?.body).toEqual({ refresh_token: 'refresh-1' });
    expect(session?.cookies.join(' ')).toContain('refresh-2');
  });

  it('sem sessão válida, /api/me responde 401 e limpa os cookies', async () => {
    const { services } = makeFakeServices(() => json({ error: 'invalid' }, 400));
    const request = new Request(`${SITE}/api/me`, { headers: { Cookie: cookieHeader({ '__Host-ca-refresh': 'velho' }) } });
    const response = await handleMe(request, services);
    expect(response.status).toBe(401);
    expect(setCookies(response).every((cookie) => cookie.includes('Max-Age=0'))).toBe(true);
  });

  it('recusa refresh token malformado sem chamar o Supabase', async () => {
    const { services, calls } = makeFakeServices(() => json({}));
    const request = new Request(`${SITE}/api/me`, { headers: { Cookie: cookieHeader({ '__Host-ca-refresh': 'x'.repeat(600) }) } });
    expect(await resolveSession(request, services)).toBeNull();
    expect(calls.length).toBe(0);
  });

  it('limite de requisições do Supabase não derruba a sessão', async () => {
    const { services } = makeFakeServices(() => json({ error: 'too many' }, 429));
    const request = new Request(SITE, { headers: { Cookie: cookieHeader({ '__Host-ca-refresh': 'refresh-1' }) } });
    await expect(resolveSession(request, services)).rejects.toMatchObject({ status: 429 });
  });

  it('/api/me pergunta ao banco o papel e devolve só os campos do contrato', async () => {
    const { services, calls } = makeFakeServices(() =>
      json({ id: 'user-1', handle: 'ana', role: 'teacher', displayName: 'Ana', avatarUrl: null, email: 'ana@example.com' }),
    );
    const response = await handleMe(new Request(`${SITE}/api/me`, { headers: { Cookie: cookieHeader({ '__Host-ca-access': accessToken() }) } }), services);
    const body = (await response.json()) as { user: Record<string, unknown> };
    expect(calls[0]?.url).toContain('/rest/v1/rpc/ensure_profile');
    expect(calls[0]?.headers.authorization).toBe(`Bearer ${accessToken()}`);
    expect(body.user).toEqual({ id: 'user-1', handle: 'ana', role: 'teacher', displayName: 'Ana', avatarUrl: null });
  });

  it('/api/me encerra a sessão quando o Supabase recusa o token', async () => {
    const { services } = makeFakeServices(() => json({ message: 'JWT expired' }, 401));
    const response = await handleMe(new Request(`${SITE}/api/me`, { headers: { Cookie: cookieHeader({ '__Host-ca-access': accessToken() }) } }), services);
    expect(response.status).toBe(401);
    expect(setCookies(response).every((cookie) => cookie.includes('Max-Age=0'))).toBe(true);
  });

  it('logout encerra no Supabase e apaga os cookies', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    const response = await handleLogout(
      new Request(`${SITE}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookieHeader({ '__Host-ca-access': accessToken() }) } }),
      services,
    );
    expect(response.status).toBe(204);
    expect(calls[0]?.url).toContain('/auth/v1/logout');
    expect(setCookies(response).length).toBe(2);
  });

  it('logout de sessão parada renova o token para revogar no Supabase', async () => {
    const { services, calls } = makeFakeServices(respondByPath({
      token: () => json({ access_token: accessToken(), refresh_token: 'refresh-2', expires_in: 3600 }),
      logout: () => new Response(null, { status: 204 }),
    }));
    const response = await handleLogout(
      new Request(`${SITE}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookieHeader({ '__Host-ca-refresh': 'refresh-1' }) } }),
      services,
    );
    expect(calls.map((call) => new URL(call.url).pathname)).toEqual(['/auth/v1/token', '/auth/v1/logout']);
    expect(setCookies(response).every((cookie) => cookie.includes('Max-Age=0'))).toBe(true);
  });
});

describe('cursos', () => {
  it('lista só pelo Supabase, com cache público', async () => {
    const { services, calls } = makeFakeServices(() => json([{ content: { slug: 'a' } }, { content: { slug: 'b' } }]));
    const response = await handleListCourses(services);
    expect(((await response.json()) as { courses: unknown[] }).courses.length).toBe(2);
    expect(calls[0]?.url).toContain('published=eq.true');
    expect(calls[0]?.url).toContain('listed=eq.true');
    expect(calls[0]?.headers.authorization).toBeUndefined();
    expect(response.headers.get('Cache-Control')).toContain('public');
  });

  it('responde 404 para slug inválido sem consultar o banco', async () => {
    const { services, calls } = makeFakeServices(() => json([]));
    expect((await handleGetCourse('../etc', services)).status).toBe(404);
    expect(calls.length).toBe(0);
    expect((await handleGetCourse('nao-existe', services)).status).toBe(404);
  });

  it('detalhe traz quem publicou, sem campos extras', async () => {
    const { services } = makeFakeServices(() =>
      json([{ content: { slug: 'a' }, owner: { handle: 'ana', display_name: 'Ana', avatar_url: null, headline: 'Engenheira de IA', role: 'teacher' } }]),
    );
    const body = (await (await handleGetCourse('a', services)).json()) as { author: unknown };
    expect(body.author).toEqual({ handle: 'ana', displayName: 'Ana', avatarUrl: null, headline: 'Engenheira de IA' });
  });
});

describe('progresso', () => {
  const authed = (method: string, body?: unknown) =>
    new Request(`${SITE}/api/progress/engenharia-de-ia`, {
      method,
      headers: { Cookie: cookieHeader({ '__Host-ca-access': accessToken() }), 'Content-Type': 'application/json', Origin: SITE },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  it('exige sessão', async () => {
    const { services, calls } = makeFakeServices(() => json([]));
    const response = await handleGetProgress(new Request(`${SITE}/api/progress/engenharia-de-ia`), 'engenharia-de-ia', services);
    expect(response.status).toBe(401);
    expect(calls.length).toBe(0);
  });

  it('lê com o token da pessoa, para o RLS valer', async () => {
    const { services, calls } = makeFakeServices(() => json([{ data: emptyProgress, revision: 7 }]));
    const response = await handleGetProgress(authed('GET'), 'engenharia-de-ia', services);
    expect(await response.json()).toEqual({ progress: emptyProgress, revision: 7 });
    expect(calls[0]?.headers.authorization).toBe(`Bearer ${accessToken()}`);
    expect(calls[0]?.url).toContain('user_id=eq.user-1');
  });

  it('recusa progresso fora do formato', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 201 }));
    const response = await handlePutProgress(authed('PUT', { progress: { completedItems: { '<script>': true } } }), 'engenharia-de-ia', services);
    expect(response.status).toBe(422);
    expect(calls.length).toBe(0);
  });

  it('salva pela função do banco, com a revisão de partida, e devolve a nova', async () => {
    const { services, calls } = makeFakeServices(() => json(4));
    const response = await handlePutProgress(authed('PUT', { progress: emptyProgress, baseRevision: 3 }), 'engenharia-de-ia', services);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revision: 4 });
    expect(calls[0]?.url).toContain('/rest/v1/rpc/save_course_progress');
    expect(calls[0]?.headers.authorization).toBe(`Bearer ${accessToken()}`);
    expect(calls[0]?.body).toEqual({ p_slug: 'engenharia-de-ia', p_data: { ...emptyProgress, projectChecks: {}, projectDeliveries: {} }, p_base_revision: 3 });
  });

  it('aba com código antigo, sem revisão, salva sem conferir', async () => {
    const { services, calls } = makeFakeServices(() => json(1));
    await handlePutProgress(authed('PUT', { progress: emptyProgress }), 'engenharia-de-ia', services);
    expect((calls[0]?.body as { p_base_revision: unknown }).p_base_revision).toBeNull();
  });

  it('progresso salvo em outra aba depois da revisão de partida vira 409', async () => {
    const { services } = makeFakeServices(() => json({ code: 'PT409', hint: 'progress-conflict' }, 409));
    const response = await handlePutProgress(authed('PUT', { progress: emptyProgress, baseRevision: 1 }), 'engenharia-de-ia', services);
    expect(response.status).toBe(409);
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('progress-conflict');
  });

  it('curso não publicado também vira 404, sem revelar que existe', async () => {
    const { services } = makeFakeServices(() => json({ code: '42501' }, 403));
    expect((await handlePutProgress(authed('PUT', { progress: emptyProgress }), 'rascunho', services)).status).toBe(404);
  });

  it('limite de escrita do banco vira 429', async () => {
    const { services } = makeFakeServices(() => json({ code: 'PT429', hint: 'rate-limited' }, 429));
    const response = await handlePutProgress(authed('PUT', { progress: emptyProgress }), 'engenharia-de-ia', services);
    expect(response.status).toBe(429);
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe('rate-limited');
  });

  it('erro ao salvar ainda devolve os cookies renovados', async () => {
    const { services } = makeFakeServices(respondByPath({
      token: () => json({ access_token: accessToken(), refresh_token: 'refresh-2', expires_in: 3600 }),
      course_progress: () => json({}, 500),
    }));
    const request = new Request(`${SITE}/api/progress/engenharia-de-ia`, {
      method: 'PUT',
      headers: { Cookie: cookieHeader({ '__Host-ca-refresh': 'refresh-1' }), 'Content-Type': 'application/json', Origin: SITE },
      body: JSON.stringify({ progress: emptyProgress }),
    });
    const response = await handlePutProgress(request, 'engenharia-de-ia', services);
    expect(response.status).toBe(502);
    expect(setCookies(response).join(' ')).toContain('refresh-2');
  });

  it('apaga só o progresso da pessoa', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    expect((await handleDeleteProgress(authed('DELETE'), 'engenharia-de-ia', services)).status).toBe(204);
    expect(calls[0]?.method).toBe('DELETE');
    expect(calls[0]?.url).toContain('user_id=eq.user-1');
  });

  it('cookies lidos corretamente com valores codificados', () => {
    expect(parseCookies('a=1; b=%2Fcursos; c')).toEqual({ a: '1', b: '/cursos' });
  });
});
