import { base64UrlEncode } from './base64url-encode';

export function createRandomToken(byteLength = 32): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));
}
