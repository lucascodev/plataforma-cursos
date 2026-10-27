import { z } from 'zod';
import { smallCountSchema } from './small-count.schema.ts';

export const teacherCourseStatsSchema = z.object({
  students: smallCountSchema,
  active7d: smallCountSchema,
  projectsDelivered: smallCountSchema,
  completed: smallCountSchema,
  modules: z
    .array(z.object({ moduleId: z.string().max(60), shortTitle: z.string().max(200), people: smallCountSchema }))
    .max(60),
});

export type TeacherCourseStatsRecord = z.infer<typeof teacherCourseStatsSchema>;
