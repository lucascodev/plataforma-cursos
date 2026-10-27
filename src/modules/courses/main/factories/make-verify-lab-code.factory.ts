import { makeHttpClient } from '@/shared/main/factories/make-http-client.factory';
import { VerifyLabCodeUseCase } from '../../application/use-cases/verify-lab-code.use-case';
import { HttpLabRepository } from '../../infra/repositories/http-lab.repository';

export function makeVerifyLabCode(): VerifyLabCodeUseCase {
  return new VerifyLabCodeUseCase(new HttpLabRepository(makeHttpClient()));
}
