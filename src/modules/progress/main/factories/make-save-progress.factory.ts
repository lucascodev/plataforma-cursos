import { makeClock } from '@/shared/main/factories/make-clock.factory';
import { SaveProgressUseCase } from '../../application/use-cases/save-progress.use-case';
import { makeProgressRepository } from './make-progress-repository.factory';

export function makeSaveProgress(): SaveProgressUseCase {
  return new SaveProgressUseCase(makeProgressRepository(), makeClock());
}
