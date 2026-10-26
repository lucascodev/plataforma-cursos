import type { Course } from '../../entities/course/course.entity';
import type { CourseTotals } from '../../entities/summary/course-totals.entity';
import { weeksForModule } from '../plan/schedule/weeks-for-module.rule';

export function summarizeCourseTotals(course: Course): CourseTotals {
  const { weekdayHours, saturdayHours, sundayHours } = course.rhythm;
  const weeklyHours = weekdayHours * 5 + saturdayHours + sundayHours;
  const weeks = course.modules.reduce((sum, module) => sum + weeksForModule(module), 0);
  return {
    modules: course.modules.length,
    lessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
    drills: course.modules.reduce((sum, module) => sum + module.drills.length, 0),
    projects: course.modules.filter((module) => module.kind === 'standard').length,
    hasCapstone: course.modules.some((module) => module.kind === 'capstone'),
    months: course.modules.reduce((sum, module) => sum + module.months, 0),
    weeks,
    hours: weeks * weeklyHours,
    weeklyHours,
  };
}
