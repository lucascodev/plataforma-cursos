import { z } from 'zod';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { VersionChecker } from '@/shared/application/ports/version/version-checker.interface';

const VERSION_FILE_PATH = '/version.json';
const versionFileSchema = z.object({ buildId: z.string().min(1).max(100) });

export class HttpVersionChecker implements VersionChecker {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly buildId: string,
  ) {}

  currentBuildId(): string {
    return this.buildId;
  }

  async publishedBuildId(): Promise<string | null> {
    try {
      const parsed = versionFileSchema.safeParse(await this.httpClient.request({ path: VERSION_FILE_PATH }));
      return parsed.success ? parsed.data.buildId : null;
    } catch {
      // Offline, or the dev server without a version file: not knowing is not a reason to bother anyone.
      return null;
    }
  }
}
