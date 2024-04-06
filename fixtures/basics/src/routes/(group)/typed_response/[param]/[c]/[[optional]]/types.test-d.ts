import { api } from "kitva";
import { expectTypeOf, test } from "vitest";
import type { RouteParams } from "./$types";
import type { POST_body, POST_headers, POST_queries, PUT_body } from "./schemas.out";
import type { EndpointValidationResponse } from "kitva/server";

const fetch = async (...[url, init]: Parameters<typeof global.fetch>) => {
	return new Response("{}");
};

const params = {
	c: "11",
	param: "a"
};

test("fetch correct types and response types", async () => {
	const res = await api(fetch, "/(group)/typed_response/[param]/[c]/[[optional]]", {
		method: "POST",
		params,
		queries: {
			a: "1"
		},
		headers: {
			authorization: "234234"
		},
		body: {
			a: "string"
		}
	});

	if (res.ok) {
		const data = await res.json();
		expectTypeOf(data).toMatchTypeOf<{
			ok: boolean;
			params: RouteParams;
			queries: POST_queries;
			headers: POST_headers;
			body: POST_body;
		}>();
	} else {
		const data = await res.json();
		expectTypeOf(data).toMatchTypeOf<EndpointValidationResponse | { error: string }>();
		expectTypeOf(res.status).toBeNumber();
	}
});

test("required parameters", async () => {
	//@ts-expect-error input params required(method, body, etc.)
	api(fetch, "/(group)/typed_response/[param]/[c]/[[optional]]", {});

	// @ts-expect-error missing headers and queries
	api(fetch, "/(group)/typed_response/[param]/[c]/[[optional]]", {
		method: "POST",
		params,
		body: {
			a: "str"
		}
	});

	// params not required
	api(fetch, "/endpoints/typed", {
		method: "POST",
		body: {
			a: "string"
		}
	});

	// @ts-expect-error method required
	await api(fetch, "/endpoints/typed", {
		headers: {
			a: "test"
		}
	});

	// no body, params required
	const response = await api(fetch, "/endpoints/typed", {
		method: "GET",
		headers: {
			a: "test"
		}
	});

	if (response.ok) {
		const data = await response.json();
		expectTypeOf(data).toEqualTypeOf<{ header: string }>();
	}
});

test("types works with two methods", async () => {
	const response = await api(fetch, "/(group)/typed_response/[param]/[c]/[[optional]]", {
		method: "PUT",
		params: {
			c: "string",
			param: "ss",
			aa: "string"
		},
		body: {
			put: "str"
		}
	});

	if (response.ok) {
		const data = await response.json();
		expectTypeOf(data.body).toEqualTypeOf<PUT_body>();
	} else if (response.status == 404) {
		const data = await response.json();
		expectTypeOf(data).toEqualTypeOf<{ error: string }>();
	} else {
		const data = await response.json();
		expectTypeOf(data).toEqualTypeOf<EndpointValidationResponse>();
	}
});
