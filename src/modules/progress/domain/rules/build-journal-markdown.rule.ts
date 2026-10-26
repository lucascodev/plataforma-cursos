import type { CourseProgress } from '../entities/course-progress.entity';
import type { JournalExport } from '../entities/journal-export.entity';

export function buildJournalMarkdown(progress: CourseProgress, journalExport: JournalExport): string {
  const lines = [
    `# Diário de estudo · ${journalExport.courseTitle}`,
    '',
    `Exportado em ${journalExport.exportedOn}. Progresso: ${journalExport.completionPercent}%. Módulo atual: ${journalExport.currentModuleTitle}.`,
    '',
  ];

  const notedModules = journalExport.modules.filter((module) => progress.moduleNotes[module.id]);
  if (notedModules.length) {
    lines.push('## Caderno dos módulos', '');
    for (const module of notedModules) lines.push(`### ${module.label}`, '', (progress.moduleNotes[module.id] ?? '').trim(), '');
  }

  const dates = Object.keys(progress.journal).sort();
  if (dates.length) {
    lines.push('## Diário', '');
    for (const date of dates) {
      const label = journalExport.dayLabels[date];
      lines.push(`### ${date}${label ? ` · ${label}` : ''}`, '', (progress.journal[date] ?? '').trim(), '');
    }
  }

  if (!notedModules.length && !dates.length) {
    lines.push('Ainda não há anotações. Escreva no diário do dia ou no caderno de um módulo.');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}
