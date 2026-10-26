import { EraseProgressUseCase } from '../../application/use-cases/erase-progress.use-case';
import { makeProgressRepository } from './make-progress-repository.factory';

export function makeEraseProgress(): EraseProgressUseCase {
  return new EraseProgressUseCase(makeProgressRepository());
}
