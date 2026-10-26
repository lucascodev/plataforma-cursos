const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Session cookies are SameSite=Lax; on top of that, every request that changes data must come from this site's own pages.
// Sec-Fetch-Site is set by the browser and cannot be forged by page scripts, so it wins when present; Origin covers older browsers.
export function isSameOriginRequest(request: Request): boolean {
  if (SAFE_METHODS.has(request.method)) return true;
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite) return fetchSite === 'same-origin';
  const origin = request.headers.get('Origin');
  return origin !== null && origin === new URL(request.url).origin;
}
