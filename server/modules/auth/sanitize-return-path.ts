const INTERNAL_PATH = /^\/(?!\/)[A-Za-z0-9/_-]{0,200}$/;

// Only internal paths are accepted, so the login flow can never be used to bounce someone to another site.
export function sanitizeReturnPath(value: string | null | undefined): string {
  return value && INTERNAL_PATH.test(value) ? value : '/';
}
