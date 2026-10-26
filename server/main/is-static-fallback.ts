// When no function matches the path or the method, Pages serves the SPA's index.html. The API never answers with HTML.
export function isStaticFallback(response: Response): boolean {
  return response.headers.get('Content-Type')?.toLowerCase().startsWith('text/html') ?? false;
}
