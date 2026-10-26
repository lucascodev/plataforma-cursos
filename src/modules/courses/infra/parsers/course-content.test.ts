import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCourseContent } from './parse-course-content';

const seedDirectory = join(process.cwd(), 'supabase', 'seed', 'courses');
const seedFiles = readdirSync(seedDirectory).filter((name) => name.endsWith('.json'));
const readSeed = (file: string): unknown => JSON.parse(readFileSync(join(seedDirectory, file), 'utf8'));

describe('course content', () => {
  it('has at least one course', () => {
    expect(seedFiles.length).toBeGreaterThan(0);
  });

  for (const file of seedFiles) {
    it(`supabase/seed/courses/${file} is valid and matches its file name`, () => {
      const slug = basename(file, '.json');
      expect(parseCourseContent(file, readSeed(file)).slug).toBe(slug);
    });
  }

  it('rejects content with broken references', () => {
    const raw = readSeed(seedFiles[0] ?? '') as Record<string, unknown>;
    const broken = { ...raw, sundayTrack: { moduleId: 'nao-existe', rotation: [{ title: 'x', detail: 'y' }], milestones: [] } };
    expect(() => parseCourseContent('broken', broken)).toThrow(/sundayTrack/);
  });
});
