import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http/http-request.type';
import { HttpCourseRepository } from './http-course.repository';

const seed: unknown = JSON.parse(readFileSync(join(process.cwd(), 'supabase', 'seed', 'courses', 'engenharia-de-ia.json'), 'utf8'));

function repositoryWith(answer: (request: HttpRequest) => unknown) {
  const client: HttpClient = { request: async (request) => answer(request) };
  return new HttpCourseRepository(client);
}

describe('HttpCourseRepository', () => {
  it('lists courses and skips a broken one instead of failing the catalog', async () => {
    const originalError = console.error;
    console.error = () => undefined;
    try {
      const courses = await repositoryWith(() => ({ courses: [seed, { slug: 'quebrado' }] })).listAll();
      expect(courses.map((course) => course.slug)).toEqual(['engenharia-de-ia']);
    } finally {
      console.error = originalError;
    }
  });

  it('finds a course and maps 404 to null', async () => {
    expect((await repositoryWith(() => ({ course: seed })).findBySlug('engenharia-de-ia'))?.slug).toBe('engenharia-de-ia');
    const missing = repositoryWith(() => {
      throw new HttpRequestError(404);
    });
    expect(await missing.findBySlug('nao-existe')).toBeNull();
  });

  it('keeps who published the course and ignores a malformed author', async () => {
    const author = { handle: 'ana', displayName: 'Ana', avatarUrl: null, headline: '' };
    expect((await repositoryWith(() => ({ course: seed, author })).findBySlug('engenharia-de-ia'))?.author).toEqual(author);
    expect((await repositoryWith(() => ({ course: seed, author: { handle: 'X Y' } })).findBySlug('engenharia-de-ia'))?.author).toBeNull();
  });
});
