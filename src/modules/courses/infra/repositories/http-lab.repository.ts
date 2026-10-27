import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import { z } from 'zod';
import type { LabRepository } from '../../domain/repositories/lab.repository';
import { COURSE_API_PATHS } from '../constants/course-api-paths';

const verifyResponseSchema = z.object({ completed: z.boolean() });

export class HttpLabRepository implements LabRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async verifyCode(courseSlug: string, itemKey: string, code: string): Promise<boolean> {
    const body = await this.httpClient.request({ method: 'POST', path: COURSE_API_PATHS.verifyLab(courseSlug, itemKey), body: { code } });
    const parsed = verifyResponseSchema.safeParse(body);
    if (!parsed.success) throw new Error('Unexpected answer from the lab verification');
    return parsed.data.completed;
  }
}
