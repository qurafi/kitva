import type { AnyError, AnyRequestEvent } from "$lib/types.js";
import type { RequestEvent } from "@sveltejs/kit";
import ajvLocales from "./locales.js";

export function localize(event: AnyRequestEvent, errors: AnyError[], lang?: string | boolean) {
	const locale = lang ? String(lang) : event.url.searchParams.get("locale");
	const { validation } = event.locals;

	const localize = validation?.localize;
	if (!localize) {
		return;
	}

	if (locale && locale !== "false") {
		const user_lang = locale == "true" ? getRequestLang(event) : locale;

		return localize(user_lang, errors, event);
	}
}

export function getRequestLang(event: RequestEvent) {
	const header = event.request.headers.get("accept-language") || "*";
	const user_lang = acceptLanguage(header);
	return user_lang;
}

export function getAjvLang(lang: string) {
	lang = lang.toLowerCase();

	const keys = Object.keys(ajvLocales) as (keyof typeof ajvLocales)[];

	const exact = keys.find((key) => key.toLowerCase() == lang);
	if (!exact) {
		return keys.find((key) => lang.startsWith(key + "-")) ?? "en";
	}
	return exact;
}

// adapted from svelte's http content negotiation
type Part = { lang: string; q: number; i: number };
export function acceptLanguage(header: string) {
	if (header == "*") {
		return "en";
	}

	const parts: Part[] = [];

	header
		.toLowerCase()
		.split(",")
		.forEach((str, i) => {
			const match = /\s*([^;]+)(?:;q=([0-9.]+))?/.exec(str);

			// no match equals invalid header — ignore
			if (match) {
				const [, lang, q = "1"] = match;
				parts.push({ lang, q: +q, i });
			}
		});

	parts.sort((a, b) => {
		if (a.q !== b.q) {
			return b.q - a.q;
		}

		return a.i - b.i;
	});

	const lang = parts[0]?.lang;

	return lang !== "*" ? lang : "en";
}
