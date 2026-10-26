import type { StudyTaskKind } from '../../domain/entities/plan/study-task-kind.type';

const HEADINGS: Readonly<Record<StudyTaskKind, string>> = {
  kickoff: 'Hoje é o primeiro dia',
  'lesson-study': 'Hoje é dia de aula',
  'lesson-exercise': 'Hoje é dia de exercício',
  'lesson-review': 'Hoje é dia de revisão',
  drill: 'Hoje é dia de exercício de fixação',
  'project-plan': 'Hoje é dia de planejar o projeto',
  'project-build': 'Hoje é dia de projeto',
  'project-evaluate': 'Hoje é dia de avaliar o projeto',
  'project-publish': 'Hoje é dia de publicar o projeto',
  'self-check': 'Hoje é dia de autoavaliação',
  'sunday-rotation': 'Domingo leve',
  'sunday-milestone': 'Domingo leve',
};

export function describeTodayHeading(kind: StudyTaskKind): string {
  return HEADINGS[kind];
}
