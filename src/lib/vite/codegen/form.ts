import { createHash } from "crypto";

export function getExportName(action: string) {
	return `create_${action}_form`.replace(/(_\w)/g, (str) => str[1].toUpperCase());
}

export function getNamedImports(forms: string[]) {
	return forms.map((form) => `actions_${form}`).join(", ");
}

export function generateFormClientFunction(form: string, file: string) {
	const action_export = `actions_${form}`;
	const fn_name = getExportName(form);
	const id = createHash("shake256", { outputLength: 2 })
		.update(`${file}:${form}`)
		.digest("base64url");

	return `export const ${fn_name} = defineGenerated<ActionsData["${form}"]>("${form}", "kitva-${id}", ${action_export}, localize)`;
}
