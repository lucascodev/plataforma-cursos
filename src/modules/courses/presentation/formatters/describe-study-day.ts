import { exercisePrompt } from '../../domain/rules/module/exercise-prompt.rule';
import type { Course } from '../../domain/entities/course/course.entity';
import type { StudyTask } from '../../domain/entities/plan/study-task.entity';
import { lowerFirst } from './lower-first';
import type { StudyDayText } from './study-day-text.type';

const partSuffix = (task: StudyTask) => (task.parts > 1 ? ` (${task.part} de ${task.parts})` : '');

function exercisePrefix(task: StudyTask): string {
  if (task.parts <= 1) return '';
  if (task.part === 1) return 'Comece hoje. ';
  if (task.part === task.parts) return 'Termine e teste. ';
  return 'Continue de onde parou. ';
}

export function describeStudyDay(course: Course, task: StudyTask): StudyDayText {
  const moduleNumber = task.moduleIndex === null ? 0 : task.moduleIndex + 1;
  const module = task.moduleIndex === null ? undefined : course.modules[task.moduleIndex];
  const lesson = task.lessonIndex === null ? undefined : module?.lessons[task.lessonIndex];
  const lessonNumber = `${moduleNumber}.${(task.lessonIndex ?? 0) + 1}`;
  const lessonReference = `M${moduleNumber} · Aula ${lessonNumber}`;
  const lessonItemLabel = task.itemId ? `Concluir a aula ${lessonNumber}` : null;

  switch (task.kind) {
    case 'kickoff':
      return { title: course.kickoff.title, detail: course.kickoff.detail, reference: 'Início', itemLabel: null };
    case 'lesson-study':
      return {
        title: `Estudar: ${lesson?.title ?? ''}${partSuffix(task)}`,
        detail:
          task.part === 1
            ? `${lesson?.summary ?? ''} Use o material de apoio do módulo e anote os pontos principais no caderno.`
            : `Continue o conteúdo da aula e anote as dúvidas no caderno. Tema: ${lesson?.summary ?? ''}`,
        reference: lessonReference,
        itemLabel: lessonItemLabel,
      };
    case 'lesson-exercise':
      return {
        title: `Exercício: ${lesson?.title ?? ''}${partSuffix(task)}`,
        detail: `${exercisePrefix(task)}${lesson ? exercisePrompt(lesson.exercise) : ''}`,
        reference: lessonReference,
        itemLabel: lessonItemLabel,
      };
    case 'lesson-review':
      return {
        title: `Revisar: ${lesson?.title ?? ''}`,
        detail: 'Escreva um resumo da aula no caderno, refatore o código do exercício e, se estiver tudo certo, conclua a aula.',
        reference: lessonReference,
        itemLabel: lessonItemLabel,
      };
    case 'drill': {
      const drill = task.drillIndex === null ? undefined : module?.drills[task.drillIndex];
      const drillNumber = `${moduleNumber}.${(task.drillIndex ?? 0) + 1}`;
      return {
        title: `Fixação: ${drill?.title ?? ''}`,
        detail: drill?.task ?? '',
        reference: `M${moduleNumber} · Fixação ${drillNumber}`,
        itemLabel: `Concluir o exercício de fixação ${drillNumber}`,
      };
    }
    case 'project-plan':
      return {
        title: 'Projeto: planejar',
        detail: `${module?.project.title ?? ''}: ${module?.project.brief ?? ''} Defina escopo, estrutura do repositório e como vai medir os critérios de pronto.`,
        reference: `M${moduleNumber} · Projeto`,
        itemLabel: null,
      };
    case 'project-build': {
      const requirement = task.requirementIndex === null ? '' : (module?.project.requirements[task.requirementIndex] ?? '');
      return {
        title: `Projeto: construir${partSuffix(task)}`,
        detail: `${module?.project.title ?? ''}. Foco de hoje: ${lowerFirst(requirement)}.`,
        reference: `M${moduleNumber} · Projeto`,
        itemLabel: null,
      };
    }
    case 'project-evaluate':
      return {
        title: 'Projeto: avaliar',
        detail: `Confira cada critério de pronto: ${(module?.project.doneCriteria ?? []).join('; ')}.`,
        reference: `M${moduleNumber} · Projeto`,
        itemLabel: null,
      };
    case 'project-publish':
      return {
        title: 'Projeto: documentar e publicar',
        detail: 'Escreva o README com resultados e uma demo curta. Com tudo publicado, conclua o projeto do módulo.',
        reference: `M${moduleNumber} · Projeto`,
        itemLabel: 'Concluir o projeto do módulo',
      };
    case 'self-check':
      return {
        title: 'Autoavaliação do módulo',
        detail: `Responda no caderno do módulo: ${(module?.selfCheck ?? []).join(' ')}`,
        reference: `M${moduleNumber} · Autoavaliação`,
        itemLabel: null,
      };
    case 'sunday-rotation':
    case 'sunday-milestone': {
      const track = course.sundayTrack;
      const entries = task.kind === 'sunday-milestone' ? track?.milestones : track?.rotation;
      const entry = task.trackEntryIndex === null ? undefined : entries?.[task.trackEntryIndex];
      return {
        title: entry?.title ?? 'Descanso',
        detail: entry?.detail ?? 'Dia livre para descansar ou revisar o que ficou pendente.',
        reference: module ? `M${moduleNumber} · ${module.shortTitle}` : 'Domingo',
        itemLabel: task.itemId ? `Concluir a aula ${lessonNumber}` : null,
      };
    }
  }
}
