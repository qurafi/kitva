import { resolveRoute } from "$app/paths";
import type { LessThan } from "@sveltejs/kit";
import type { EndpointValidationResponse } from "./server/endpoints.js";
import type { IncomingHttpHeaders } from "node:http";

export interface TypedResponse<T, Status extends number = 200> extends Response {
	status: Status;
	ok: Status extends LessThan<400> ? true : false;
	json(): Promise<T>;
}

export interface TypedResponseInit<Status extends number = 200> extends ResponseInit {
	status: Status;
}

interface TInputBase {
	init?: RequestInit;
	headers?: Record<keyof IncomingHttpHeaders, string>;
	queries?: Record<string, string>;
}

interface TInput extends TInputBase {
	method: string;
	body?: unknown;
	params?: Record<string, never>;
}

export async function api<E extends keyof Endpoints, Input extends Endpoints[E]["input"]>(
	fetch: typeof globalThis.fetch = globalThis.fetch,
	endpoint: E,
	input: TInputBase & Input
) {
	const { method, params = {}, queries, headers = {}, body, init = {} } = input as TInput;

	const search_query = new URLSearchParams(queries);
	init.headers = headers;

	if (method !== "GET") {
		init.body = JSON.stringify(body);
		headers["content-type"] ??= "application/json";
	}

	const response = (await fetch(`${resolveRoute(endpoint, params)}?${search_query}`, {
		method,
		...init
	})) as
		| Awaited<ReturnType<Endpoints[E]["handlers"][Input["method"]]>>
		| TypedResponse<EndpointValidationResponse, 400>;
	return response;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Endpoints {}
}
