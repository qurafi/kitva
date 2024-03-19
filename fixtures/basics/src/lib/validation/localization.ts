import type { RequestEvent } from "@sveltejs/kit";
import { type AjvError, getAjvLang, ajvLocales, type DefinedError } from "kitva";
import { errorMessages } from "./messages";

export async function localize(
	lang: string,
	errors: AjvError[] | null | undefined,
	event?: RequestEvent
) {
	if (!errors) return;

	const locale = getAjvLang(lang);

	const localize = await ajvLocales[locale]();

	localize(
		errors?.filter((value) => {
			return value.keyword !== "errorMessage";
		})
	);

	for (const error of errors as DefinedError[]) {
		if (error.keyword == "errorMessage") {
			const messages = (errorMessages as any)[locale];
			if (messages) {
				console.log(messages[error.message], error.message);
				error.message = messages[error.message] || error.message;
			}
		}
	}
}
