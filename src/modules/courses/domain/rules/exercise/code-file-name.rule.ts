import type { Exercise } from '../../entities/course/module/exercise/exercise.entity';

type CodeLanguage = Extract<Exercise, { type: 'code' }>['language'];

const FILE_NAMES: Readonly<Record<CodeLanguage, string>> = { python: 'solucao.py', javascript: 'solucao.js', sql: 'solucao.sql' };

// Tests import the person's code from this file (for example "from solucao import chunk").
export function codeFileName(language: CodeLanguage): string {
  return FILE_NAMES[language];
}
