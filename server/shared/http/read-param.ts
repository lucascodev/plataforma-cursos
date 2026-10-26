import type { RequestContext } from './request-context.type';

export function readParam(context: RequestContext, name: string): string {
  const value = context.params[name];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}
