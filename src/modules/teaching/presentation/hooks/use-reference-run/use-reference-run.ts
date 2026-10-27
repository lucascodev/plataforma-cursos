import { useState } from 'react';
import type { CodeJob } from '@/shared/application/ports/code-runner/code-job.type';
import type { CodeRunResult } from '@/shared/application/ports/code-runner/code-run-result.type';
import { makeCodeRunner } from '@/shared/main/factories/make-code-runner.factory';

// Lets the teacher run the tests in the same isolated runner students use, before sending the version.
export function useReferenceRun() {
  const [result, setResult] = useState<CodeRunResult | null>(null);
  const [isRunning, setRunning] = useState(false);
  return {
    result,
    isRunning,
    run: async (job: CodeJob) => {
      if (isRunning) return;
      setRunning(true);
      try {
        setResult(await makeCodeRunner().run(job));
      } finally {
        setRunning(false);
      }
    },
  };
}
