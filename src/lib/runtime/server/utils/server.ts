import { is_form_content_type } from "$lib/runtime/server/utils/http.js";
import type { RequestEvent } from "@sveltejs/kit";

export type Modules = Record<string, () => Promise<Record<string, unknown>>>;

export async function getRequestContent({ request, params, url }: RequestEvent) {
	return {
		params,

		queries: Object.fromEntries(url.searchParams),

		headers: Object.fromEntries(request.headers),
		body: await getRequestBody(request)
	};
}

export async function getRequestBody(request: Request, clone = true) {
	const content_type = request.headers.get("content-type");

	if (content_type?.startsWith("application/json")) {
		/* prettier-ignore */
		return clone_if(request, clone).json().catch((_) => {/*  */});
	}

	if (is_form_content_type(request)) {
		const form_data = await clone_if(request, clone).formData();

		return parseFormData(form_data);
	}

	return request.text();
}

export function parseFormData(form_data: FormData) {
	const data: Record<string, any> = {};
	for (const [field, value] of form_data.entries()) {
		const is_string = typeof value == "string";
		if (is_string && value !== "") {
			if (data[field]) {
				if (!Array.isArray(data[field])) {
					data[field] = [data[field]];
				}
				data[field].push(value);
			} else {
				data[field] = value;
			}
		}
	}
	return data;
}

function clone_if(req: Request, b: boolean) {
	return b ? req.clone() : req;
}

export function getActionName(search: string) {
	const params = new URLSearchParams(search);
	const name = [...params.keys()].find((name) => name.startsWith("/"));
	return name ? name.slice(1) : "default";
}

export function getRouteSrc(routes: Modules, routeId: string | null, file: string) {
	if (!routeId) {
		return;
	}

	const sep = routeId == "/" ? "" : "/";
	const file_path = "/src/routes" + routeId + sep + file;

	if (file.endsWith(".svelte")) {
		return routes[file_path];
	}

	return routes[file_path + ".js"] || routes[file_path + ".ts"];
}
