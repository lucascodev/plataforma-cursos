import type { ExerciseRecord } from './exercise.schema.ts';

type CodeLanguage = Extract<ExerciseRecord, { type: 'code' }>['language'];

const FILE_NAMES: Readonly<Record<CodeLanguage, string>> = { python: 'solucao.py', javascript: 'solucao.js', sql: 'solucao.sql' };

// Tests import the person's code from this file (for example "from solucao import chunk").
export function codeFileName(language: CodeLanguage): string {
  return FILE_NAMES[language];
}
