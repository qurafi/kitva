import test, { expect } from "@playwright/test";

test("api(...) runtime", async ({ request }) => {
	const params = {
		c: "11",
		param: "a"
	};

	const body = {
		a: "string"
	};

	const headers = {
		authorization: "234234"
	};

	const queries = {
		a: "1"
	};

	const url = "/(group)/typed_response/[param]/[c]/[[optional]]";
	const input = {
		method: "POST",
		params,
		queries,
		headers,
		body
	};
	const response = await request.get(`/fetch?url=${url}&data=${JSON.stringify(input)}`);
	const data = await response.json();

	expect(data).toMatchObject({
		status: 200,
		data: {
			ok: true,
			params,
			queries,
			headers,
			body
		}
	});
});

test("api(...) no params required", async ({ request }) => {
	const url = "/endpoints/typed";
	const input = {
		method: "POST",
		body: {
			a: "string"
		}
	};
	const response = await request.get(`/fetch?url=${url}&data=${JSON.stringify(input)}`);
	const data = await response.json();
	expect(data).toMatchObject({
		status: 200,
		data: { ok: true }
	});
});

test("failed api(...): no method provided", async ({ request }) => {
	const url = "/endpoints/typed";
	const input = {
		method: "GET",
		headers: {
			a: "test"
		}
	};
	const response = await request.get(`/fetch?url=${url}&data=${JSON.stringify(input)}`);
	const data = await response.json();
	console.log(data);
	expect(data).toMatchObject({
		status: 200,
		data: { header: "test" }
	});
});

//TODO test should auto add correct content-type for body
//TODO test should include extra headers
//TODO extra queries
