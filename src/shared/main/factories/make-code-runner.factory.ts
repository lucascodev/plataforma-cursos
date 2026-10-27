import type { CodeRunner } from '@/shared/application/ports/code-runner/code-runner.interface';
import { IframeCodeRunner } from '@/shared/infra/code-runner/iframe-code-runner';

// One runner per page: the runtimes it loads (Python takes a few seconds) are reused between runs.
const runner = new IframeCodeRunner();

export function makeCodeRunner(): CodeRunner {
  return runner;
}
