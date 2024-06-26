import { getAjvLang, ajvLocales } from "kitva";

/**
 * Runs on both client and server
 * Mutate the error directly (error.message = "message")
 * lang is provided by the client instance, if true provided it will be the auto detected language
 * Discard lang arg if you want to use custom language detection
 * @type {import("kitva").Localize}
 * */
export const localize = async (lang, errors, _event) => {
	if (!errors) return;

	// localize native ajv messages
	const locale = getAjvLang(lang);

	const localize = await ajvLocales[locale]();

	localize(errors?.filter((err) => err.keyword !== "errorMessage"));

	// your own localization logic

	for (const error of /** @type {import("kitva").DefinedError[]} errors */ errors) {
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
