import { LoadProgressUseCase } from '../../application/use-cases/load-progress.use-case';
import { makeProgressRepository } from './make-progress-repository.factory';

export function makeLoadProgress(): LoadProgressUseCase {
  return new LoadProgressUseCase(makeProgressRepository());
}
