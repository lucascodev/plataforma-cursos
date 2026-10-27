import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http/http-request.type';
import { VersionConflictError } from '../../application/errors/version-conflict.error';
import { normalizeCourseDraft } from '../../domain/rules/draft/normalize-course-draft.rule';
import { InvalidTeachingResponseError } from '../errors/invalid-teaching-response.error';
import { HttpTeachingGateway } from './http-teaching.gateway';

function gatewayWith(answer: (request: HttpRequest) => unknown) {
  const requests: HttpRequest[] = [];
  const client: HttpClient = {
    async request(request) {
      requests.push(request);
      return answer(request);
    },
  };
  return { gateway: new HttpTeachingGateway(client), requests };
}

const VERSION_ID = '3f1c2a1e-5b6d-4c7e-8f90-1a2b3c4d5e6f';
const content = normalizeCourseDraft({ slug: 'curso' }, '2026-10-28');

describe('HttpTeachingGateway', () => {
  it('saves the draft with id and revision and returns the new revision', async () => {
    const { gateway, requests } = gatewayWith(() => ({ revision: 4 }));
    expect(await gateway.saveDraft({ slug: 'curso', versionId: VERSION_ID, revision: 3, content })).toBe(4);
    expect(requests[0]).toEqual({ method: 'PUT', path: '/api/teaching/courses/curso/draft', body: { versionId: VERSION_ID, revision: 3, content } });
  });

  it('turns a version conflict into VersionConflictError', async () => {
    const { gateway } = gatewayWith(() => {
      throw new HttpRequestError(409, { problem: { code: 'version-conflict', message: 'Outra aba' } });
    });
    await expect(gateway.saveDraft({ slug: 'curso', versionId: VERSION_ID, revision: 3, content })).rejects.toBeInstanceOf(VersionConflictError);
  });

  it('returns null for a course the person does not own', async () => {
    const { gateway } = gatewayWith(() => {
      throw new HttpRequestError(404);
    });
    expect(await gateway.getWorkspace('alheio')).toBeNull();
  });

  it('rejects answers that break the contract', async () => {
    const { gateway } = gatewayWith(() => ({ stats: { students: 2 } }));
    await expect(gateway.getStats('curso')).rejects.toBeInstanceOf(InvalidTeachingResponseError);
  });

  it('lists and registers lab completion codes', async () => {
    const { gateway, requests } = gatewayWith((request) => (request.method === 'PUT' ? undefined : { codes: { 'm1-t3': 'LAB-AB12CD34' } }));
    expect(await gateway.listLabCodes('curso')).toEqual({ 'm1-t3': 'LAB-AB12CD34' });
    await gateway.setLabCode({ slug: 'curso', itemKey: 'm1-t3', code: '' });
    expect(requests[1]).toEqual({ method: 'PUT', path: '/api/teaching/courses/curso/lab-codes/m1-t3', body: { code: '' } });
  });
});
