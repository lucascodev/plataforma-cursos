import { RequestBodyError } from './request-body-error';

export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new RequestBodyError('wrong-type');
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > maxBytes) throw new RequestBodyError('too-large');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new RequestBodyError('too-large');
  try {
    return JSON.parse(text);
  } catch {
    throw new RequestBodyError('not-json');
  }
}
