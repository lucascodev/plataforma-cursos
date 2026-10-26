import { RequestBodyError } from './request-body-error';

// Content-Length can be missing (chunked uploads) or wrong, so the body is read as a stream and dropped as soon as it passes the limit.
async function readTextWithin(request: Request, maxBytes: number): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RequestBodyError('too-large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new RequestBodyError('wrong-type');
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > maxBytes) throw new RequestBodyError('too-large');
  const text = await readTextWithin(request, maxBytes);
  try {
    return JSON.parse(text);
  } catch {
    throw new RequestBodyError('not-json');
  }
}
