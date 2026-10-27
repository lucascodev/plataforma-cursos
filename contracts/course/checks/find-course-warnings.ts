import type { CourseCheck } from './course-check.type.ts';

const MIN_DESCRIPTION_LENGTH = 200;

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const asList = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);

// Things that do not block sending but usually make a course weaker. Reads the draft defensively: it may be incomplete.
export function findCourseWarnings(content: unknown): CourseCheck[] {
  const course = asRecord(content);
  const warnings: CourseCheck[] = [];
  const description = typeof course.description === 'string' ? course.description.trim() : '';
  if (description.length > 0 && description.length < MIN_DESCRIPTION_LENGTH) {
    warnings.push({
      severity: 'warning',
      path: ['description'],
      where: 'Descrição',
      message: `Tem ${description.length} letras. Uma descrição com pelo menos ${MIN_DESCRIPTION_LENGTH} ajuda quem decide se vai estudar.`,
    });
  }
  if (asList(asRecord(course.guide).sections).length === 0) {
    warnings.push({ severity: 'warning', path: ['guide'], where: 'Guia', message: 'O curso ainda não tem guia de estudo.' });
  }
  asList(course.modules).forEach((value, index) => {
    const module = asRecord(value);
    if (module.kind === 'continuous') return;
    const where = `M${index + 1}`;
    if (asList(module.drills).length === 0) {
      warnings.push({ severity: 'warning', path: ['modules', index, 'drills'], where, message: 'Sem exercícios de fixação.' });
    }
    if (asList(module.resources).length === 0) {
      warnings.push({ severity: 'warning', path: ['modules', index, 'resources'], where, message: 'Sem material de apoio.' });
    }
  });
  return warnings;
}
