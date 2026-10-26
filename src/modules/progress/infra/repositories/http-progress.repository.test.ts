import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http/http-request.type';
import { ProgressStorageError } from '../../domain/errors/progress-storage.error';
import { createEmptyProgress } from '../../domain/rules/create-empty-progress.rule';
import { setItemCompletion } from '../../domain/rules/updates/set-item-completion.rule';
import { HttpProgressRepository } from './http-progress.repository';

function repositoryWith(answer: (request: HttpRequest) => unknown) {
  const requests: HttpRequest[] = [];
  const client: HttpClient = {
    async request(request) {
      requests.push(request);
      return answer(request);
    },
  };
  return { repository: new HttpProgressRepository(client), requests };
}

const saved = setItemCompletion(createEmptyProgress(), 'm1-t0', true);

describe('HttpProgressRepository', () => {
  it('loads, saves and clears through the course route', async () => {
    const { repository, requests } = repositoryWith((request) => (request.method === undefined ? { progress: saved } : null));
    expect(await repository.load('engenharia-de-ia')).toEqual(saved);
    await repository.save('engenharia-de-ia', saved);
    await repository.clear('engenharia-de-ia');
    expect(requests).toEqual([
      { path: '/api/progress/engenharia-de-ia' },
      { method: 'PUT', path: '/api/progress/engenharia-de-ia', body: { progress: saved } },
      { method: 'DELETE', path: '/api/progress/engenharia-de-ia' },
    ]);
  });

  it('returns null when there is no progress yet', async () => {
    expect(await repositoryWith(() => ({ progress: null })).repository.load('c')).toBeNull();
  });

  it('refuses an unreadable answer instead of showing an empty course', async () => {
    await expect(repositoryWith(() => ({ progress: { completedItems: 'x' } })).repository.load('c')).rejects.toThrow(ProgressStorageError);
  });

  it('keeps session expiry distinct from storage failures', async () => {
    const expired = repositoryWith(() => {
      throw new SessionExpiredError();
    });
    await expect(expired.repository.save('c', saved)).rejects.toThrow(SessionExpiredError);
    const failing = repositoryWith(() => {
      throw new HttpRequestError(502);
    });
    await expect(failing.repository.save('c', saved)).rejects.toThrow(ProgressStorageError);
  });

  it('lists only completion flags and study days for the profile page', async () => {
    const { repository, requests } = repositoryWith(() => ({
      items: [{ courseSlug: 'engenharia-de-ia', updatedAt: '2026-11-02T12:00:00+00:00', completedItems: { 'm1-t0': true, 'm1-cp': true }, studyDays: { '2026-11-01': true } }],
    }));
    expect(await repository.listSummaries()).toEqual([
      { courseSlug: 'engenharia-de-ia', updatedAt: '2026-11-02T12:00:00+00:00', completedItemIds: ['m1-t0', 'm1-cp'], studyDayCount: 1 },
    ]);
    expect(requests).toEqual([{ path: '/api/progress' }]);
  });
});
