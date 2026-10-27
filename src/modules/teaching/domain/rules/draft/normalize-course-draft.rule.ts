import { defaultDrillId } from '@contracts/course/item-ids/default-drill-id';
import { defaultLessonId } from '@contracts/course/item-ids/default-lesson-id';
import type { EditableCourse } from '../../entities/draft/editable-course.entity';
import type { EditableGuideSection } from '../../entities/draft/editable-guide-section.entity';
import type { EditableModule } from '../../entities/draft/editable-module.entity';

type Loose = Record<string, unknown>;

const DRAFT_VERSION = '0.1.0';
const DEFAULT_RHYTHM = { weekdayHours: 1, saturdayHours: 3, sundayHours: 1 };
const MODULE_KINDS: readonly EditableModule['kind'][] = ['standard', 'capstone', 'continuous'];

const record = (value: unknown): Loose => (value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Loose) : {});
const list = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
const texts = (value: unknown): string[] => list(value).map(text);
const amount = (value: unknown, fallback: number): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

function normalizeModule(value: unknown, index: number): EditableModule {
  const module = record(value);
  const project = record(module.project);
  const kind = MODULE_KINDS.find((candidate) => candidate === module.kind) ?? 'standard';
  return {
    id: text(module.id) || `m${index + 1}`,
    shortTitle: text(module.shortTitle),
    title: text(module.title),
    kind,
    months: amount(module.months, kind === 'continuous' ? 0 : 1),
    ...(typeof module.projectDays === 'number' ? { projectDays: module.projectDays } : {}),
    prerequisite: text(module.prerequisite),
    goal: text(module.goal),
    caseStudy: text(module.caseStudy),
    ...(typeof module.lowSpecTip === 'string' ? { lowSpecTip: module.lowSpecTip } : {}),
    lessons: list(module.lessons).map((lesson, lessonIndex) => {
      const item = record(lesson);
      return { id: text(item.id) || defaultLessonId(lessonIndex), title: text(item.title), summary: text(item.summary), exercise: text(item.exercise) };
    }),
    drills: list(module.drills).map((drill, drillIndex) => {
      const item = record(drill);
      return { id: text(item.id) || defaultDrillId(drillIndex), title: text(item.title), task: text(item.task) };
    }),
    project: {
      title: text(project.title),
      brief: text(project.brief),
      requirements: texts(project.requirements),
      doneCriteria: texts(project.doneCriteria),
    },
    selfCheck: texts(module.selfCheck),
    resources: list(module.resources).map((resource) => {
      const item = record(resource);
      return { type: text(item.type), label: text(item.label), url: text(item.url) };
    }),
  };
}

function normalizeGuideSection(value: unknown): EditableGuideSection {
  const section = record(value);
  const link = record(section.link);
  return {
    title: text(section.title),
    ...(typeof section.intro === 'string' ? { intro: section.intro } : {}),
    items: texts(section.items),
    ...(section.link ? { link: { label: text(link.label), url: text(link.url) } } : {}),
  };
}

// Reads whatever the database holds (a fresh draft from a proposal has only a few fields) into the full editable shape.
export function normalizeCourseDraft(content: unknown, today: string): EditableCourse {
  const course = record(content);
  const rhythm = record(course.rhythm);
  const kickoff = record(course.kickoff);
  const guide = record(course.guide);
  return {
    slug: text(course.slug),
    title: text(course.title),
    tagline: text(course.tagline),
    description: text(course.description),
    level: text(course.level),
    audience: text(course.audience),
    version: text(course.version) || DRAFT_VERSION,
    updatedAt: text(course.updatedAt) || today,
    rhythm: {
      weekdayHours: amount(rhythm.weekdayHours, DEFAULT_RHYTHM.weekdayHours),
      saturdayHours: amount(rhythm.saturdayHours, DEFAULT_RHYTHM.saturdayHours),
      sundayHours: amount(rhythm.sundayHours, DEFAULT_RHYTHM.sundayHours),
    },
    kickoff: { title: text(kickoff.title), detail: text(kickoff.detail) },
    // The Sunday track has its own editor in a later release; it is kept exactly as it was.
    ...(course.sundayTrack ? { sundayTrack: course.sundayTrack as EditableCourse['sundayTrack'] } : {}),
    modules: list(course.modules).map(normalizeModule),
    guide: {
      ...(guide.architecture ? { architecture: guide.architecture as NonNullable<EditableCourse['guide']>['architecture'] } : {}),
      sections: list(guide.sections).map(normalizeGuideSection),
    },
  };
}
