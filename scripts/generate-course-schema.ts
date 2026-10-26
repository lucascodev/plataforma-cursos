import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { courseContentSchema } from '../contracts/course/course-content.schema.ts';

const OUTPUT = new URL('../contracts/course/course.schema.json', import.meta.url);

const schema = z.toJSONSchema(courseContentSchema, { target: 'draft-7' });
writeFileSync(OUTPUT, `${JSON.stringify({ ...schema, $id: 'course.schema.json', title: 'Curso da plataforma Cursos Abertos' }, null, 2)}\n`);
console.log('contracts/course/course.schema.json updated.');
