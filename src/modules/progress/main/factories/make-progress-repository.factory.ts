import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import type { ProgressRepository } from '../../domain/repositories/progress.repository';
import { HttpProgressRepository } from '../../infra/repositories/http-progress.repository';

export function makeProgressRepository(): ProgressRepository {
  return new HttpProgressRepository(makeHttpClient());
}
