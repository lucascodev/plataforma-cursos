import type { NavBadges } from '../../domain/entities/nav-badges.entity';
import type { AdminGateway } from '../ports/admin-gateway.interface';

export class GetNavBadgesUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(): Promise<NavBadges> {
    return this.adminGateway.getNavBadges();
  }
}
