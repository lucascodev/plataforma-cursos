import type { CodeJob } from '../../application/ports/code-runner/code-job.type';
import type { CodeRunResult } from '../../application/ports/code-runner/code-run-result.type';
import type { CodeRunner } from '../../application/ports/code-runner/code-runner.interface';
import { codeRunResultSchema } from './code-run-result.schema';

const RUNNER_PATH = '/runner/';
const READY_TIMEOUT_MS = 15_000;
// The runner has its own limits; this one only covers the runner itself disappearing.
const ANSWER_TIMEOUT_MS = 180_000;
const UNAVAILABLE: CodeRunResult = { results: [], error: 'O ambiente de código não respondeu. Recarregue a página e tente de novo.', output: '' };

// Course code runs in an iframe with sandbox="allow-scripts" and no allow-same-origin (see public/runner/runner.js):
// an opaque origin with no access to the session, the API or this page. Messages from it are checked by source.
export class IframeCodeRunner implements CodeRunner {
  private frame: HTMLIFrameElement | null = null;
  private ready: Promise<boolean> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  run(job: CodeJob): Promise<CodeRunResult> {
    const next = this.queue.then(() => this.runNow(job));
    this.queue = next.catch(() => undefined);
    return next;
  }

  private async runNow(job: CodeJob): Promise<CodeRunResult> {
    const frame = await this.open();
    if (!frame?.contentWindow) return UNAVAILABLE;
    const target = frame.contentWindow;
    const id = crypto.randomUUID();
    return new Promise((resolve) => {
      const finish = (result: CodeRunResult) => {
        window.removeEventListener('message', onMessage);
        clearTimeout(timer);
        resolve(result);
      };
      const onMessage = (event: MessageEvent) => {
        if (event.source !== target || event.data?.type !== 'runner-result' || event.data.id !== id) return;
        const parsed = codeRunResultSchema.safeParse(event.data.result);
        finish(parsed.success ? parsed.data : UNAVAILABLE);
      };
      const timer = setTimeout(() => {
        this.reset();
        finish(UNAVAILABLE);
      }, ANSWER_TIMEOUT_MS);
      window.addEventListener('message', onMessage);
      // The target is an opaque origin, which cannot be named here; the window reference is what identifies it.
      target.postMessage({ type: 'runner-run', id, job }, '*');
    });
  }

  private open(): Promise<HTMLIFrameElement | null> {
    if (this.frame && this.ready) return this.ready.then((ok) => (ok ? this.frame : null));
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.title = 'Executor de código';
    frame.hidden = true;
    frame.src = RUNNER_PATH;
    this.frame = frame;
    this.ready = new Promise<boolean>((resolve) => {
      const onMessage = (event: MessageEvent) => {
        if (event.source !== frame.contentWindow || event.data?.type !== 'runner-ready') return;
        window.removeEventListener('message', onMessage);
        clearTimeout(timer);
        resolve(true);
      };
      const timer = setTimeout(() => {
        window.removeEventListener('message', onMessage);
        this.reset();
        resolve(false);
      }, READY_TIMEOUT_MS);
      window.addEventListener('message', onMessage);
    });
    document.body.append(frame);
    return this.ready.then((ok) => (ok ? frame : null));
  }

  private reset(): void {
    this.frame?.remove();
    this.frame = null;
    this.ready = null;
  }
}
