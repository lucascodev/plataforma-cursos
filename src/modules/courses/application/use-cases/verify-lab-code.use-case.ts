import type { LabRepository } from '../../domain/repositories/lab.repository';

export class VerifyLabCodeUseCase {
  constructor(private readonly labRepository: LabRepository) {}

  execute(courseSlug: string, itemKey: string, code: string): Promise<boolean> {
    return this.labRepository.verifyCode(courseSlug, itemKey, code.replace(/\s/g, '').toUpperCase());
  }
}
