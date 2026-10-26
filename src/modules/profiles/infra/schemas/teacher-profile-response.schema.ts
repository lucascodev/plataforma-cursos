import { teacherProfileSchema } from '@contracts/teacher-profile.schema';
import { z } from 'zod';

export const teacherProfileResponseSchema = z.object({ teacher: teacherProfileSchema });
