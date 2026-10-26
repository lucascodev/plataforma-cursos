import { describe, expect, it } from 'vitest';
import type { Clock } from '@/shared/application/ports/clock.interface';
import { InvalidBackupError } from '../../domain/errors/invalid-backup.error';
import { createEmptyProgress } from '../../domain/rules/create-empty-progress.rule';
import { setItemCompletion } from '../../domain/rules/set-item-completion.rule';
import { JsonBackupCodec } from '../../infra/codecs/json-backup.codec';
import { InMemoryProgressRepository } from '../../infra/repositories/in-memory-progress.repository';
import { LoadProgressUseCase } from './load-progress.use-case';
import { ReadBackupUseCase } from './read-backup.use-case';
import { SaveProgressUseCase } from './save-progress.use-case';

const fixedClock: Clock = { today: () => '2026-10-26', now: () => new Date('2026-10-26T13:00:00.000Z') };

describe('LoadProgressUseCase', () => {
  it('starts from empty progress when the account has nothing for the course', async () => {
    const result = await new LoadProgressUseCase(new InMemoryProgressRepository()).execute({ courseSlug: 'engenharia-de-ia' });
    expect(result.progress).toEqual(createEmptyProgress());
  });
});

describe('SaveProgressUseCase', () => {
  it('stamps the save time', async () => {
    const repository = new InMemoryProgressRepository();
    await new SaveProgressUseCase(repository, fixedClock).execute({ courseSlug: 'c', progress: createEmptyProgress() });
    expect((await repository.load('c'))?.updatedAt).toBe('2026-10-26T13:00:00.000Z');
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
