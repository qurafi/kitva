import type { RequestEvent } from "@sveltejs/kit";
import { is_form_content_type } from "./http.js";
import { DEV } from "esm-env";

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
        return clone_if(request, clone)
            .json()
            .catch((v) => {}); // return nothing when json is invalid
    } else if (is_form_content_type(request)) {
        const formdata = await clone_if(request, clone).formData();
        const data: Record<string, any> = {};
        for (const [field, value] of formdata.entries()) {
            const not_string = typeof value != "string";
            if (value != "" || not_string) {
                data[field] = value;
            }

            if (DEV && not_string) {
                throw new Error("kitva: files are not supported");
            }
        }

        return data;
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
