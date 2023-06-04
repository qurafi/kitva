import { RequestEvent } from "@sveltejs/kit";
import { is_form_content_type } from "./http.js";

export * from "./http.js";

export type Modules = Record<string, () => Promise<Record<string, unknown>>>;

export async function getRequestContent({ request, params, url }: RequestEvent) {
    return {
        params,

        get queries() {
            return Object.fromEntries(url.searchParams);
        },
        get headers() {
            return Object.fromEntries(request.headers);
        },
        get body() {
            return getRequestBody(request);
        },
    };
}

export async function getRequestBody(request: Request, clone = true) {
    const content_type = request.headers.get("content-type");
    if (content_type == "application/json") {
        return clone_if(request, clone).json();
    } else if (is_form_content_type(request)) {
        return Object.fromEntries(await clone_if(request, clone).formData());
    }
}
// sometimes if you don't have another hook accessing the data, it is better to just use the orignal request
// to avoid unnecessary request cloning, the parsed data will be always available in locals
// in validation[part].data assuming it's valid
function clone_if(req: Request, b: boolean) {
    return b ? req.clone() : req;
}

export function getActionName(s: string) {
    return s.startsWith("?/") ? s.slice(2) : "default";
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
