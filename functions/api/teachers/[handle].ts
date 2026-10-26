import { makeServices } from '../../../server/main/make-services';
import { handleGetTeacherProfile } from '../../../server/modules/profiles/handlers/handle-get-teacher-profile';
import { readParam } from '../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleGetTeacherProfile(readParam(context, 'handle'), makeServices(context.env));
