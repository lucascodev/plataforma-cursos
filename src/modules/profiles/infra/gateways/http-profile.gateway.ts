import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import type { z } from 'zod';
import type { UpdateMyProfileInputDto } from '../../application/dtos/update-my-profile-input.dto';
import type { ProfileGateway } from '../../application/ports/profile-gateway.interface';
import type { AccountSettings } from '../../domain/entities/account-settings.entity';
import type { MyProfile } from '../../domain/entities/my-profile.entity';
import type { TeacherProfile } from '../../domain/entities/teacher/teacher-profile.entity';
import { PROFILE_API_PATHS } from '../constants/profile-api-paths';
import { InvalidProfileResponseError } from '../errors/invalid-profile-response.error';
import { accountSettingsResponseSchema } from '../schemas/account-settings-response.schema';
import { myProfileResponseSchema } from '../schemas/my-profile-response.schema';
import { teacherProfileResponseSchema } from '../schemas/teacher-profile-response.schema';

export class HttpProfileGateway implements ProfileGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getMyProfile(): Promise<MyProfile> {
    const body = await this.httpClient.request({ path: PROFILE_API_PATHS.myProfile });
    return this.parse(PROFILE_API_PATHS.myProfile, myProfileResponseSchema, body).profile;
  }

  async updateMyProfile(input: UpdateMyProfileInputDto): Promise<MyProfile> {
    const body = await this.httpClient.request({ method: 'PUT', path: PROFILE_API_PATHS.myProfile, body: input });
    return this.parse(PROFILE_API_PATHS.myProfile, myProfileResponseSchema, body).profile;
  }

  async getAccountSettings(): Promise<AccountSettings> {
    const body = await this.httpClient.request({ path: PROFILE_API_PATHS.settings });
    return this.parse(PROFILE_API_PATHS.settings, accountSettingsResponseSchema, body).settings;
  }

  async updateAccountSettings(settings: AccountSettings): Promise<AccountSettings> {
    const body = await this.httpClient.request({ method: 'PUT', path: PROFILE_API_PATHS.settings, body: settings });
    return this.parse(PROFILE_API_PATHS.settings, accountSettingsResponseSchema, body).settings;
  }

  async getTeacherProfile(handle: string): Promise<TeacherProfile | null> {
    const path = PROFILE_API_PATHS.teacher(handle);
    try {
      return this.parse(path, teacherProfileResponseSchema, await this.httpClient.request({ path })).teacher;
    } catch (error) {
      if (error instanceof HttpRequestError && error.status === 404) return null;
      throw error;
    }
  }

  private parse<T>(path: string, schema: z.ZodType<T>, body: unknown): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new InvalidProfileResponseError(path, { cause: parsed.error });
    return parsed.data;
  }
}
