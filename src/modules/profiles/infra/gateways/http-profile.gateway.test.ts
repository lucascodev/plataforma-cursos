import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http/http-request.type';
import { InvalidProfileResponseError } from '../errors/invalid-profile-response.error';
import { HttpProfileGateway } from './http-profile.gateway';

function gatewayWith(answer: (request: HttpRequest) => unknown) {
  const requests: HttpRequest[] = [];
  const client: HttpClient = {
    async request(request) {
      requests.push(request);
      return answer(request);
    },
  };
  return { gateway: new HttpProfileGateway(client), requests };
}

const profile = {
  id: 'user-1',
  handle: 'ana',
  role: 'teacher',
  displayName: 'Ana',
  avatarUrl: null,
  headline: 'Engenheira de IA',
  shortBio: '',
  bio: '',
  links: [],
  showStudentCount: false,
  createdAt: '2026-11-02T12:00:00+00:00',
};
const settings = { timezone: 'America/Sao_Paulo', theme: 'dark', notify: { proposalUpdates: true, weeklySummary: false } };

describe('HttpProfileGateway', () => {
  it('reads and saves the profile through /api/me/profile', async () => {
    const { gateway, requests } = gatewayWith(() => ({ profile }));
    expect(await gateway.getMyProfile()).toEqual(profile);
    const input = { displayName: 'Ana', headline: 'Engenheira de IA', shortBio: '', bio: 'Oi', links: [], showStudentCount: true };
    await gateway.updateMyProfile(input);
    expect(requests[1]).toEqual({ method: 'PUT', path: '/api/me/profile', body: input });
  });

  it('saves settings and refuses an unexpected answer', async () => {
    expect(await gatewayWith(() => ({ settings })).gateway.updateAccountSettings(settings as never)).toEqual(settings);
    await expect(gatewayWith(() => ({ settings: { theme: 'neon' } })).gateway.getAccountSettings()).rejects.toThrow(InvalidProfileResponseError);
  });

  it('returns null for a teacher page that does not exist', async () => {
    const missing = gatewayWith(() => {
      throw new HttpRequestError(404);
    });
    expect(await missing.gateway.getTeacherProfile('bia')).toBeNull();
    expect(missing.requests[0]).toEqual({ path: '/api/teachers/bia' });
  });
});
