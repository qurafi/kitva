import { randomBytes } from "crypto";

export function generate$formDts(forms: string[]) {
	return `import { GeneratedValidationClient, AjvError } from "kitva";
import { Schemas } from "./schemas.types";
export {withValidation} from "./$types2"

${forms
	.map((form) => {
		return `export const ${getExportName(form)}: GeneratedValidationClient<
    Schemas["actions"]["${form}"],
    AjvError
>;`;
	})
	.join("\n\n")}`;
}

function getExportName(action: string) {
	return `create_${action}_form`.replace(/(_\w)/g, (str) => str[1].toUpperCase());
}

export function generateClientCode(schema_import: string, forms: string[]) {
	return `import { ${forms.map((form) => `actions_${form}`).join(", ")} } from "${schema_import}";
    
    import { createValidationClient, createAjvValidateFn, getFormErrors } from "kitva";
    import {localize} from "/src/lib/validation/localization";

    export {withValidation} from "kitva/server";
    
    ${forms
		.map((form) => {
			return `export function ${getExportName(form)}(opts={}) {
            const validate = createAjvValidateFn(actions_${form}, true);
        
            return createValidationClient({
                validate,
                getFormErrors,
                action: "${form}",
                form_id: "kitva-${randomBytes(2).toString("base64url")}",
                localize,
                ...opts
            });
        };`;
		})
		.join("\n\n")}`;
}
