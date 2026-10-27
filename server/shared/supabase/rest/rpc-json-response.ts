import type { z } from 'zod';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../http/responses/json-response';
import type { ProblemMessages } from '../../http/responses/problem-message.type';
import { problemResponse } from '../../http/responses/problem-response';
import { readUpstreamJson } from '../../http/upstream/read-upstream-json';
import { upstreamProblem } from '../../http/upstream/upstream-problem';
import { callRpc } from './call-rpc';

export interface RpcCall<T> {
  readonly name: string;
  readonly args: Record<string, unknown>;
  readonly accessToken: string;
  readonly schema: z.ZodType<T> | null;
  readonly toBody: (data: T) => unknown;
  readonly messages: ProblemMessages;
  readonly unavailableMessage: string;
}

// The database function checks who is calling; this only turns its answer into the API response.
export async function rpcJsonResponse<T>(services: Services, call: RpcCall<T>): Promise<Response> {
  const response = await callRpc(services, call.name, call.args, call.accessToken);
  if (!response.ok) return upstreamProblem(response, call.messages, call.unavailableMessage);
  if (!call.schema) return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  const data = await readUpstreamJson(response, call.schema);
  if (data === null) return problemResponse(502, 'unavailable', call.unavailableMessage);
  return jsonResponse(call.toBody(data));
}
