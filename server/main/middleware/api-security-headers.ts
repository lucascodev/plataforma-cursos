export const API_SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-origin',
  // JSON only: nothing in an API response may load, run or be framed.
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};
