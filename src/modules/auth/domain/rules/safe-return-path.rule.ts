// Same rule as server/modules/auth/sanitize-return-path.ts: only paths inside this site, never "//other-host".
const INTERNAL_PATH = /^\/(?!\/)[A-Za-z0-9/_-]{0,200}$/;

export function safeReturnPath(candidate: string | null, fallback: string): string {
  return candidate && INTERNAL_PATH.test(candidate) ? candidate : fallback;
}
