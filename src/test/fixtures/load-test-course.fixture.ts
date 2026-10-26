import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Course } from '@/modules/courses/domain/entities/course/course.entity';
import { parseCourseContent } from '@/modules/courses/infra/parsers/parse-course-content';

export function loadTestCourse(slug = 'engenharia-de-ia'): Course {
  const raw: unknown = JSON.parse(readFileSync(join(process.cwd(), 'supabase', 'seed', 'courses', `${slug}.json`), 'utf8'));
  return parseCourseContent(slug, raw);
}
