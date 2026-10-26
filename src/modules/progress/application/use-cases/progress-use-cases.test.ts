import { describe, expect, it } from 'vitest';
import type { Clock } from '@/shared/application/ports/clock.interface';
import { InvalidBackupError } from '../../domain/errors/invalid-backup.error';
import { createEmptyProgress } from '../../domain/rules/create-empty-progress.rule';
import { setItemCompletion } from '../../domain/rules/updates/set-item-completion.rule';
import { JsonBackupCodec } from '../../infra/codecs/json-backup.codec';
import { InMemoryProgressRepository } from '../../infra/repositories/in-memory-progress.repository';
import { LoadProgressUseCase } from './load-progress.use-case';
import { ReadBackupUseCase } from './backup/read-backup.use-case';
import { SaveProgressUseCase } from './save-progress.use-case';

const fixedClock: Clock = { today: () => '2026-10-26', now: () => new Date('2026-10-26T13:00:00.000Z') };

describe('LoadProgressUseCase', () => {
  it('starts from empty progress when the account has nothing for the course', async () => {
    const result = await new LoadProgressUseCase(new InMemoryProgressRepository()).execute({ courseSlug: 'engenharia-de-ia' });
    expect(result.progress).toEqual(createEmptyProgress());
  });
});

describe('SaveProgressUseCase', () => {
  const empty = { progress: createEmptyProgress(), revision: 0 };

  it('stamps the save time and returns the new revision', async () => {
    const repository = new InMemoryProgressRepository();
    const saved = await new SaveProgressUseCase(repository, fixedClock).execute({ courseSlug: 'c', progress: createEmptyProgress(), base: empty });
    expect(saved.revision).toBe(1);
    expect((await repository.load('c'))?.progress.updatedAt).toBe('2026-10-26T13:00:00.000Z');
  });

  it('merges with what another tab saved instead of overwriting it', async () => {
    const repository = new InMemoryProgressRepository();
    const useCase = new SaveProgressUseCase(repository, fixedClock);
    await useCase.execute({ courseSlug: 'c', progress: setItemCompletion(createEmptyProgress(), 'm1-t1', true), base: empty });

    const saved = await useCase.execute({ courseSlug: 'c', progress: setItemCompletion(createEmptyProgress(), 'm1-t2', true), base: empty });

    expect(saved.revision).toBe(2);
    expect(Object.keys(saved.progress.completedItems).sort()).toEqual(['m1-t1', 'm1-t2']);
    expect((await repository.load('c'))?.progress.completedItems).toEqual(saved.progress.completedItems);
  });
});

describe('ReadBackupUseCase', () => {
  const codec = new JsonBackupCodec();
  const useCase = new ReadBackupUseCase(codec);
  const backup = codec.encode({
    format: 'cursos-abertos/progresso',
    version: 1,
    courseSlug: 'engenharia-de-ia',
    exportedAt: '2026-10-26T13:00:00.000Z',
    progress: setItemCompletion(createEmptyProgress(), 'm1-t0', true),
  });

  it('reads a valid backup and summarizes it', () => {
    const result = useCase.execute({ courseSlug: 'engenharia-de-ia', content: backup, sizeInBytes: backup.length });
    expect(result.completedItems).toBe(1);
  });

  it('rejects oversized files, other courses, invalid JSON and tampered data', () => {
    const read = (content: string, courseSlug = 'engenharia-de-ia', size = content.length) => () =>
      useCase.execute({ courseSlug, content, sizeInBytes: size });
    expect(read(backup, 'engenharia-de-ia', 5_000_000)).toThrow(InvalidBackupError);
    expect(read(backup, 'outro-curso')).toThrow(InvalidBackupError);
    expect(read('{nao e json')).toThrow(InvalidBackupError);
    expect(read(backup.replace('"m1-t0"', '"<script>"'))).toThrow(InvalidBackupError);
  });
});
