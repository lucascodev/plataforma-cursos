import { describe, expect, it } from 'vitest';
import { handleListProgress } from '../modules/progress/handlers/handle-list-progress';
import { handleGetMyProfile } from '../modules/profiles/handlers/handle-get-my-profile';
import { handleGetMySettings } from '../modules/profiles/handlers/handle-get-my-settings';
import { handleGetTeacherProfile } from '../modules/profiles/handlers/handle-get-teacher-profile';
import { handlePutMyProfile } from '../modules/profiles/handlers/handle-put-my-profile';
import { handlePutMySettings } from '../modules/profiles/handlers/handle-put-my-settings';
import { json, makeFakeServices } from './fakes/fake-supabase';
import { signedIn, signedOut } from './fakes/test-requests';

const profileRow = {
  id: 'user-1',
  handle: 'ana',
  role: 'student',
  displayName: 'Ana',
  avatarUrl: null,
  bio: '',
  links: [],
  showStudentCount: false,
  createdAt: '2026-11-02T12:00:00+00:00',
};
const validProfile = { displayName: 'Ana Souza', bio: 'Estudo IA.', links: [{ label: 'Site', url: 'https://ana.dev' }], showStudentCount: true };

describe('perfil e conta', () => {
  it('perfil exige sessão', async () => {
    const { services, calls } = makeFakeServices(() => json([]));
    expect((await handleGetMyProfile(signedOut('/api/me/profile'), services)).status).toBe(401);
    expect(calls.length).toBe(0);
  });

  it('lê o próprio perfil com o token da pessoa', async () => {
    const { services, calls } = makeFakeServices(() => json([{ ...profileRow, email: 'ana@example.com' }]));
    const response = await handleGetMyProfile(signedIn('/api/me/profile'), services);
    const body = (await response.json()) as { profile: Record<string, unknown> };
    expect(calls[0]?.url).toContain('profiles?id=eq.user-1');
    expect(calls[0]?.headers.authorization).toContain('Bearer ');
    expect(body.profile.email).toBeUndefined();
  });

  it('salva só campos editáveis e recusa link sem https', async () => {
    const { services, calls } = makeFakeServices(() => json([{ ...profileRow, displayName: 'Ana Souza' }]));
    const bad = await handlePutMyProfile(
      signedIn('/api/me/profile', { method: 'PUT', body: { ...validProfile, links: [{ label: 'x', url: 'javascript:alert(1)' }] } }),
      services,
    );
    expect(bad.status).toBe(422);
    expect(calls.length).toBe(0);

    const good = await handlePutMyProfile(signedIn('/api/me/profile', { method: 'PUT', body: { ...validProfile, role: 'admin' } }), services);
    expect(good.status).toBe(200);
    expect(calls[0]?.method).toBe('PATCH');
    expect(calls[0]?.body).toEqual({ display_name: 'Ana Souza', bio: 'Estudo IA.', links: validProfile.links, show_student_count: true });
  });

  it('preferências: padrão quando não existem e fuso inválido é recusado', async () => {
    const { services } = makeFakeServices(() => json([]));
    const body = (await (await handleGetMySettings(signedIn('/api/me/settings'), services)).json()) as { settings: { theme: string } };
    expect(body.settings.theme).toBe('system');

    const { services: putServices, calls } = makeFakeServices(() => new Response(null, { status: 201 }));
    const bad = await handlePutMySettings(
      signedIn('/api/me/settings', { method: 'PUT', body: { timezone: 'Lua/Base', theme: 'dark', notify: { proposalUpdates: true, weeklySummary: false } } }),
      putServices,
    );
    expect(bad.status).toBe(422);
    const good = await handlePutMySettings(
      signedIn('/api/me/settings', { method: 'PUT', body: { timezone: 'America/Recife', theme: 'dark', notify: { proposalUpdates: true, weeklySummary: false } } }),
      putServices,
    );
    expect(good.status).toBe(200);
    expect(calls[0]?.url).toContain('on_conflict=user_id');
    expect(calls[0]?.body).toMatchObject({ user_id: 'user-1', timezone: 'America/Recife' });
  });

  it('resumo de estudos nunca pede notas nem diário', async () => {
    const { services, calls } = makeFakeServices(() =>
      json([{ courseSlug: 'engenharia-de-ia', updatedAt: '2026-11-02T12:00:00+00:00', completedItems: { 'm1-t0': true }, studyDays: null }]),
    );
    const body = (await (await handleListProgress(signedIn('/api/progress'), services)).json()) as { items: { studyDays: unknown }[] };
    expect(calls[0]?.url).not.toContain('journal');
    expect(calls[0]?.url).not.toContain('moduleNotes');
    expect(body.items[0]?.studyDays).toEqual({});
  });
});

describe('perfil público de professor', () => {
  it('recusa endereço inválido sem consultar o banco', async () => {
    const { services, calls } = makeFakeServices(() => json(null));
    expect((await handleGetTeacherProfile('../admin', services)).status).toBe(404);
    expect(calls.length).toBe(0);
  });

  it('perfil que não é público vira 404', async () => {
    const { services } = makeFakeServices(() => json(null));
    expect((await handleGetTeacherProfile('bia', services)).status).toBe(404);
  });

  it('responde com cache público e sem token', async () => {
    const { services, calls } = makeFakeServices(() =>
      json({ handle: 'ana', displayName: 'Ana', avatarUrl: null, bio: '', links: [], courses: [], studentCount: null }),
    );
    const response = await handleGetTeacherProfile('ana', services);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('public');
    expect(calls[0]?.headers.authorization).toBeUndefined();
    expect(calls[0]?.body).toEqual({ p_handle: 'ana' });
  });
});
