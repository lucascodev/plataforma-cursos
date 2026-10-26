import { describe, expect, it } from 'vitest';
import type { CourseSummaryOutputDto } from '@/modules/courses';
import { buildFeaturedCourseView } from './build-featured-course-view';
import { buildTodaySampleView } from './build-today-sample-view';

const course = {
  slug: 'engenharia-de-ia',
  title: 'Engenharia de IA',
  tagline: 'Chamada',
  description: 'Descrição',
  level: 'Intermediário',
  audience: 'Devs',
  version: '1.0.0',
  updatedAt: '2026-10-26',
  rhythm: { weekdayHours: 1, saturdayHours: 3, sundayHours: 1 },
  kickoff: { title: 'Início do curso', detail: 'Monte sua rotina.' },
  author: null,
  modules: [
    { id: 'm1', code: 'M1', shortTitle: 'Fundamentos', title: 'Fundamentos de LLM', kind: 'standard', months: 2, lessonCount: 8, projectTitle: 'Mini GPT' },
    { id: 'm9', code: 'M9', shortTitle: 'Carreira', title: 'Carreira', kind: 'continuous', months: 0, lessonCount: 4, projectTitle: 'Portfólio' },
  ],
  totals: { modules: 2, lessons: 12, drills: 3, projects: 1, hasCapstone: false, months: 2, weeks: 8, hours: 72, weeklyHours: 9 },
} satisfies CourseSummaryOutputDto;

describe('landing', () => {
  it('mostra o primeiro dia do curso em destaque começando hoje', () => {
    const sample = buildTodaySampleView(course, '2026-10-31');
    expect(sample.dateLabel).toBe('Hoje · sábado, 31 out');
    expect(sample.hoursLabel).toBe('3 h');
    expect(sample.title).toBe('Início do curso');
    expect(sample.week.map((day) => `${day.weekday} ${day.day}`)).toEqual(['sáb 31', 'dom 1', 'seg 2', 'ter 3', 'qua 4', 'qui 5', 'sex 6']);
    expect(sample.week[0]?.isToday).toBe(true);
  });

  it('descreve a trilha com meses ou domingos', () => {
    expect(buildFeaturedCourseView(course).trail.map((module) => module.meta)).toEqual(['2 meses', 'aos domingos']);
  });
});
