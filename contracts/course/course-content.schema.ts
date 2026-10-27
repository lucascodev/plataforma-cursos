import { z } from 'zod';
import { defaultDrillId } from './item-ids/default-drill-id.ts';
import { defaultLessonId } from './item-ids/default-lesson-id.ts';
import { drillIdSchema } from './item-ids/drill-id.schema.ts';
import { lessonIdSchema } from './item-ids/lesson-id.schema.ts';
import { exerciseSchema } from './exercise/exercise.schema.ts';

const text = (max: number) => z.string().trim().min(1).max(max);
const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith('https://'), 'Use links https.');
const identifier = z.string().regex(/^[a-z0-9-]{1,60}$/, 'Use letras minúsculas, números e hífens.');

// A plain text exercise is how courses were written before the exercise types; it still works.
const lessonSchema = z.object({ id: lessonIdSchema.optional(), title: text(120), summary: text(600), exercise: z.union([text(800), exerciseSchema]) });
const drillSchema = z.object({ id: drillIdSchema.optional(), title: text(120), task: text(800) });
const projectSchema = z.object({
  title: text(160),
  brief: text(800),
  requirements: z.array(text(400)).min(1).max(20),
  doneCriteria: z.array(text(400)).min(1).max(20),
});
const resourceSchema = z.object({ type: text(20), label: text(200), url: httpsUrl });
const taskTextSchema = z.object({ title: text(160), detail: text(800) });

const moduleSchema = z.object({
  id: identifier,
  shortTitle: text(40),
  title: text(160),
  kind: z.enum(['standard', 'capstone', 'continuous']),
  months: z.number().min(0).max(24),
  projectDays: z.number().int().min(4).max(60).optional(),
  prerequisite: text(400),
  goal: text(600),
  caseStudy: text(600),
  lowSpecTip: text(800).optional(),
  lessons: z.array(lessonSchema).min(1).max(40),
  drills: z.array(drillSchema).max(20),
  project: projectSchema,
  selfCheck: z.array(text(300)).min(1).max(10),
  resources: z.array(resourceSchema).max(30),
});

const architectureSchema = z.object({
  title: text(160),
  description: text(800),
  rows: z
    .array(z.object({ nodes: z.array(z.object({ title: text(80), detail: text(200), highlight: z.boolean().optional() })).min(1).max(6) }))
    .min(1)
    .max(8),
  bands: z.array(z.object({ tone: z.enum(['accent', 'warning']), text: text(300) })).max(6),
});

const guideSchema = z.object({
  architecture: architectureSchema.optional(),
  sections: z
    .array(
      z.object({
        title: text(120),
        intro: text(600).optional(),
        items: z.array(text(500)).min(1).max(15),
        link: z.object({ label: text(120), url: httpsUrl }).optional(),
      }),
    )
    .max(8),
});

export const courseContentSchema = z
  .object({
    slug: identifier,
    title: text(120),
    tagline: text(240),
    description: text(2000),
    level: text(40),
    audience: text(200),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Use versão no formato 1.0.0.'),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a data no formato AAAA-MM-DD.'),
    rhythm: z.object({
      weekdayHours: z.number().min(0).max(8),
      saturdayHours: z.number().min(0).max(12),
      sundayHours: z.number().min(0).max(12),
    }),
    kickoff: taskTextSchema,
    sundayTrack: z
      .object({
        moduleId: identifier,
        rotation: z.array(taskTextSchema).min(1).max(12),
        milestones: z
          .array(taskTextSchema.extend({ sunday: z.number().int().min(-60).max(260), lessonIndex: z.number().int().min(0).optional() }))
          .max(30),
      })
      .optional(),
    modules: z.array(moduleSchema).min(1).max(30),
    guide: guideSchema.optional(),
  })
  .superRefine((course, context) => {
    const ids = course.modules.map((module) => module.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: 'custom', path: ['modules'], message: 'Há módulos com o mesmo id.' });
    }
    course.modules.forEach((module, index) => {
      const itemIds = [
        ...module.lessons.map((lesson, lessonIndex) => lesson.id ?? defaultLessonId(lessonIndex)),
        ...module.drills.map((drill, drillIndex) => drill.id ?? defaultDrillId(drillIndex)),
      ];
      if (new Set(itemIds).size !== itemIds.length) {
        context.addIssue({ code: 'custom', path: ['modules', index], message: 'Há aulas ou exercícios com o mesmo id neste módulo.' });
      }
      const continuous = module.kind === 'continuous';
      if (continuous !== (module.months === 0)) {
        context.addIssue({
          code: 'custom',
          path: ['modules', index, 'months'],
          message: 'Só módulos "continuous" têm months igual a 0.',
        });
      }
    });
    const track = course.sundayTrack;
    if (!track) return;
    const trackModule = course.modules.find((module) => module.id === track.moduleId);
    if (!trackModule) {
      context.addIssue({ code: 'custom', path: ['sundayTrack', 'moduleId'], message: 'O módulo da trilha de domingo não existe.' });
      return;
    }
    track.milestones.forEach((milestone, index) => {
      if (milestone.lessonIndex !== undefined && milestone.lessonIndex >= trackModule.lessons.length) {
        context.addIssue({
          code: 'custom',
          path: ['sundayTrack', 'milestones', index, 'lessonIndex'],
          message: 'A aula indicada não existe no módulo da trilha de domingo.',
        });
      }
    });
  });

export type CourseContent = z.infer<typeof courseContentSchema>;
