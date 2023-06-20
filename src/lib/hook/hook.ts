import type { Handle, RequestEvent } from "@sveltejs/kit";
import { DEV } from "esm-env";
import type { EventWithValidation, HttpMethod, HttpPart, ValidationResults } from "../types.js";
import { is_endpoint_request } from "../utils/http.js";
import { HTTP_PARTS, createDebug } from "../utils/index.js";
import { getActionName, getRequestContent, getRouteSrc, type Modules } from "../utils/svelte.js";
import type { ValidationOptions } from "./types.js";
import { validation_hooks } from "./handleValidate.js";

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
	const page_server_module = getRouteSrc(routes, routeId, "+page.server")!;
	const server_module = getRouteSrc(routes, routeId, "+server");

	const req = event.request;

	// we make sure the conditions are similar to what's defined in sveltekit
	const is_endpoint = server_module && (!has_page || is_endpoint_request(event));
	const is_form = !is_endpoint && req.method == "POST" && has_page;

	const action_name = is_form ? getActionName(event.url.search) : undefined;

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
		queries: {}
	};

	event.locals.validation = validation;

	async function validatePart(part: HttpPart) {
		const validate = await getValidation({
			isEndpoint: is_endpoint as any,
			routeId: routeId!,
			module: schema_module!,
			method: event.request.method as HttpMethod,
			part: part,
			action: action_name
		});

		if (!validate) {
			return;
		}

		const result = validate(inputs[part]);

		validation[part] = result;

		if (!result.valid) {
			validation.valid = false;
		}

		return result;
	}

	let response: Response | undefined;
	let called = false;

	async function validate() {
		called = true;
		if (is_endpoint) {
			for (const part of HTTP_PARTS) {
				const result = await validatePart(part);
				if (result && !result.valid) {
					response = getEndpointError(result.errors, part);
					return;
				}
			}
		}

		// for form validation, only validate the body
		// there's no current way in sveltekit to change form result in the hook
		// so we passed in request locals and let the form action handle it manually (see withValidation);
		const result = await validatePart("body");
		if (result && !result.valid) {
			//@ts-expect-error already false
			validation.formErrors = getFormErrors(result.errors);
		}
	}

	let handler: any;

	if (is_form) {
		const module = await page_server_module();
		handler = (module["actions"] as any)?.[action_name!];
	} else if (is_endpoint) {
		const module = await server_module();
		handler = module[req.method];
	}

	const handle_validate = validation_hooks.get(handler);

	const handle_result = await handle_validate?.({
		event: event as EventWithValidation<never>,
		input: inputs,
		validate: async () => {
			await validate();
			return validation;
		}
	});

	if (!called && handle_result !== false) {
		if (DEV && handle_validate) {
			throw new Error("handleValidate didn't call validate()");
		}
		await validate();
	}

	if (response) {
		return response;
	}
}
