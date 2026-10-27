import type { SetLabCodeInputDto } from '../dtos/set-lab-code-input.dto';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class SetLabCodeUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  // Spaces and case do not matter, the same way the student's code is read.
  execute(input: SetLabCodeInputDto): Promise<void> {
    return this.teachingGateway.setLabCode({ ...input, code: input.code.replace(/\s/g, '').toUpperCase() });
  }
}
