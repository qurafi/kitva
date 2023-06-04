// source: https://github.com/sveltejs/kit/blob/master/packages/kit/src/utils/http.js

/**
 * Given an Accept header and a list of possible content types, pick
 * the most suitable one to respond with
 * @param {string} accept
 * @param {string[]} types
 */
export function negotiate(accept, types) {
    /** @type {Array<{ type: string, subtype: string, q: number, i: number }>} */
    const parts = [];

    accept.split(",").forEach((str, i) => {
        const match = /([^/]+)\/([^;]+)(?:;q=([0-9.]+))?/.exec(str);

        // no match equals invalid header — ignore
        if (match) {
            const [, type, subtype, q = "1"] = match;
            parts.push({ type, subtype, q: +q, i });
        }
    });

    parts.sort((a, b) => {
        if (a.q !== b.q) {
            return b.q - a.q;
        }

        if ((a.subtype === "*") !== (b.subtype === "*")) {
            return a.subtype === "*" ? 1 : -1;
        }

        if ((a.type === "*") !== (b.type === "*")) {
            return a.type === "*" ? 1 : -1;
        }

        return a.i - b.i;
    });

    let accepted;
    let min_priority = Infinity;

    for (const mimetype of types) {
        const [type, subtype] = mimetype.split("/");
        const priority = parts.findIndex(
            (part) =>
                (part.type === type || part.type === "*") &&
                (part.subtype === subtype || part.subtype === "*")
        );

        if (priority !== -1 && priority < min_priority) {
            accepted = mimetype;
            min_priority = priority;
        }
    }

    return accepted;
}

/**
 * Returns `true` if the request contains a `content-type` header with the given type
 * @param {Request} request
 * @param  {...string} types
 */
function is_content_type(request, ...types) {
    const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
    return types.includes(type.toLowerCase());
}

/**
 * @param {Request} request
 */
export function is_form_content_type(request) {
    // These content types must be protected against CSRF
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/enctype
    return is_content_type(
        request,
        "application/x-www-form-urlencoded",
        "multipart/form-data"
        // "text/plain"
    );
}

/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
export function is_endpoint_request(event) {
    const { method, headers } = event.request;

    if (
        method === "PUT" ||
        method === "PATCH" ||
        method === "DELETE" ||
        method === "OPTIONS"
    ) {
        // These methods exist exclusively for endpoints
        return true;
    }

    // use:enhance uses a custom header to disambiguate
    if (method === "POST" && headers.get("x-sveltekit-action") === "true") return false;

    // GET/POST requests may be for endpoints or pages. We prefer endpoints if this isn't a text/html request
    const accept = event.request.headers.get("accept") ?? "*/*";
    return negotiate(accept, ["*", "text/html"]) !== "text/html";
}
