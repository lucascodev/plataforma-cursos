export function emptyResponse(): Response {
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
