import type { LabCodes } from '../../domain/entities/lab-codes.entity';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class ListLabCodesUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(slug: string): Promise<LabCodes> {
    return this.teachingGateway.listLabCodes(slug);
  }
}
