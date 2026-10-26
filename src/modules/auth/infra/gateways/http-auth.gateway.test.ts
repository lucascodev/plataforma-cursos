import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import type { HttpClient } from '@/shared/application/ports/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http-request.type';
import { InvalidAuthResponseError } from '../errors/invalid-auth-response.error';
import { HttpAuthGateway } from './http-auth.gateway';

function gatewayWith(answer: (request: HttpRequest) => unknown) {
  const requests: HttpRequest[] = [];
  const visited: string[] = [];
  const client: HttpClient = {
    async request(request) {
      requests.push(request);
      return answer(request);
    },
  };
  return { gateway: new HttpAuthGateway(client, (url) => visited.push(url)), requests, visited };
}

const user = { id: 'user-1', handle: 'ana', role: 'student', displayName: 'Ana', avatarUrl: 'https://avatars.githubusercontent.com/u/1' };

describe('HttpAuthGateway', () => {
  it('returns the signed in user', async () => {
    expect(await gatewayWith(() => ({ user })).gateway.getCurrentUser()).toEqual(user);
  });

  it('treats 401 as signed out and keeps other failures visible', async () => {
    const signedOut = gatewayWith(() => {
      throw new SessionExpiredError();
    });
    expect(await signedOut.gateway.getCurrentUser()).toBeNull();
    const offline = gatewayWith(() => {
      throw new HttpRequestError(null);
    });
    await expect(offline.gateway.getCurrentUser()).rejects.toThrow(HttpRequestError);
  });

  it('rejects an unexpected body, including an untrusted avatar', async () => {
    const tampered = gatewayWith(() => ({ user: { ...user, avatarUrl: 'https://evil.example/a.png' } }));
    await expect(tampered.gateway.getCurrentUser()).rejects.toThrow(InvalidAuthResponseError);
  });

  it('starts the login on the server and posts the logout', async () => {
    const { gateway, requests, visited } = gatewayWith(() => null);
    gateway.signInWithGitHub('/cursos/engenharia-de-ia');
    expect(visited).toEqual(['/api/auth/login?returnTo=%2Fcursos%2Fengenharia-de-ia']);
    await gateway.signOut();
    expect(requests).toEqual([{ method: 'POST', path: '/api/auth/logout' }]);
  });
});
