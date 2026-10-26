import type { ProjectStage } from '../../domain/entities/plan/project-stage.entity';

export const PROJECT_STAGE_LABELS: Readonly<Record<ProjectStage['kind'], { readonly title: string; readonly hint: string }>> = {
  'project-plan': { title: 'Planejar', hint: 'Escopo, arquitetura e tarefas' },
  'project-build': { title: 'Construir', hint: 'Um requisito por vez' },
  'project-evaluate': { title: 'Avaliar', hint: 'Conferir o "pronto quando"' },
  'project-publish': { title: 'Publicar', hint: 'README, prints e entrega' },
};
