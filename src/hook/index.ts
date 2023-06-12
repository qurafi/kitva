import type { Handle, RequestEvent } from "@sveltejs/kit";
import type { HttpMethod, HttpPart, ValidationResults } from "../types.js";
import { is_endpoint_request } from "../utils/http.js";
import { HTTP_PARTS, createDebug } from "../utils/index.js";
import {
    getActionName,
    getRequestContent,
    getRouteSrc,
    type Modules,
} from "../utils/svelte.js";
import type { ValidationOptions } from "./types.js";

const debug = createDebug("hook:core");

// TODO test if this will work with vite dep prebundling
const routes = import.meta.glob("/src/routes/**/*.{ts,js,svelte}") as Modules;

export function validationHook(opts: ValidationOptions): Handle {
    return async ({ event, resolve }) => {
        const response = await validateRequest(event, routes, opts);

        if (response instanceof Response) {
            return response;
        }

        return resolve(event);
    };
}

async function validateRequest(
    event: RequestEvent,
    routes: Modules,
    opts: ValidationOptions
): Promise<Response | undefined | void> {
    const routeId = event.route.id;
    debug({ routes, opts, routeId });
    if (!routeId || event.isDataRequest) {
        return;
    }

    const schema_module = getRouteSrc(routes, routeId, "schemas");
    if (!schema_module) {
        return;
    }

    const has_page = getRouteSrc(routes, routeId, "+page.svelte");
    const has_endpoint = getRouteSrc(routes, routeId, "+server");

    const req = event.request;

    // we make sure the conditions are similar to what's defined in sveltekit
    const is_endpoint = has_endpoint && (!has_page || is_endpoint_request(event));
    const is_form = !is_endpoint && req.method == "POST" && has_page;

    const should_validate = is_endpoint || is_form;

    if (!should_validate) {
        return;
    }

    const { getEndpointError, getFormErrors, getValidation } = opts;

    const inputs = await getRequestContent(event);

    const validation = <ValidationResults>{
        valid: true,
        body: {},
        headers: {},
        params: {},
        queries: {},
    };

    event.locals.validation = validation;

    async function validatePart(part: HttpPart) {
        const validate = await getValidation({
            isEndpoint: is_endpoint as any,
            routeId: routeId!,
            module: schema_module!,
            method: event.request.method as HttpMethod,
            part: part,
            action: is_form ? getActionName(event.url.search) : undefined,
        });

        if (!validate) {
            return;
        }

        const input = await inputs[part];

        const result = validate(input);

        validation[part] = result;

        if (!result.valid) {
            validation.valid = false;
            if (is_endpoint) {
                return getEndpointError(result.errors, part);
            }

            //@ts-expect-error already false
            validation.formErrors = getFormErrors(result.errors);
        }
    }

    if (is_endpoint) {
        for (const part of HTTP_PARTS) {
            const result = await validatePart(part);
            if (result instanceof Response) {
                return result;
            }
        }
    }

    // for form validation, only validate the body
    // there's no current way in sveltekit to change form result in the hook
    // so we passed in request locals and let the form action handle it manually (see withValidation)
    await validatePart("body");
}
