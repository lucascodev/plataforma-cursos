import type { VersionChecker } from '@/shared/application/ports/version/version-checker.interface';
import { HttpVersionChecker } from '@/shared/infra/version/http-version-checker';
import { makeHttpClient } from './make-http-client.factory';

export function makeVersionChecker(): VersionChecker {
  return new HttpVersionChecker(makeHttpClient(), __BUILD_ID__);
}
