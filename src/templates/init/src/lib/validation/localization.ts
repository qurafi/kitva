import { getAjvLang, ajvLocales, type DefinedError, type Localize } from "kitva";

/**
 * Runs on both client and server
 * Mutate the error directly (error.message = "message")
 * lang is provided by the client instance, if true provided it will be the auto detected language
 * Discard lang arg if you want to use custom language detection
 * */
export const localize: Localize = async (lang, errors, _event) => {
	// localize native ajv messages
	const locale = getAjvLang(lang);

	const localize = await ajvLocales[locale]();

	localize(errors?.filter((err) => err.keyword !== "errorMessage"));

	// your own localization logic
	if (!errors) return;

	for (const error of errors as DefinedError[]) {
		if (error.keyword == "errorMessage") {
			// custom error message
		} else {
			// // ajv built-in:
			// switch (error.keyword) {
			// 	case "format":
			// 		error.message = `must be valid ${error.params.format}`;
			// 		break;
			// }
		}
	}
};
