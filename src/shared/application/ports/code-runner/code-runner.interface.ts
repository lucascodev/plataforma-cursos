import type { CodeJob } from './code-job.type';
import type { CodeRunResult } from './code-run-result.type';

export interface CodeRunner {
  run(job: CodeJob): Promise<CodeRunResult>;
}
