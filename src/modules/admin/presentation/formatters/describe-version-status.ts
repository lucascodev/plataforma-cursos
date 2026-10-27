import type { AdminCourseVersion } from '../../domain/entities/versions/admin-course-version.entity';

const LABELS: Readonly<Record<AdminCourseVersion['status'], string>> = {
  draft: 'Rascunho',
  in_review: 'Esperando revisão',
  changes_requested: 'Ajustes pedidos',
  published: 'Publicada',
  superseded: 'Versão anterior',
};

export function describeVersionStatus(status: AdminCourseVersion['status']): string {
  return LABELS[status];
}
