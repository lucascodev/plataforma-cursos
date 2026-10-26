export function withCookies(response: Response, cookies: readonly string[]): Response {
  if (cookies.length === 0) return response;
  const result = new Response(response.body, response);
  for (const cookie of cookies) result.headers.append('Set-Cookie', cookie);
  return result;
}
