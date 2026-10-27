import type { CodeLanguage } from './code-language.type';

/** tests: one test source, every test inside reports a result. checks: each check runs on its own. */
export interface CodeJob {
  readonly language: CodeLanguage;
  readonly mode: 'tests' | 'checks';
  readonly files: Readonly<Record<string, string>>;
  readonly tests?: string;
  readonly checks?: readonly { readonly id: string; readonly test: string }[];
}
