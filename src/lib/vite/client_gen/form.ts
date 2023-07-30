import { randomBytes } from "crypto";

export function generate$formDts(forms: string[]) {
	return `import { GeneratedValidationClient, AjvError } from "kitva";
import { Schemas } from "./schema_types";

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
    
    import { createValidationClient, createAjvValidateFn, getAjvFormErrors as getFormErrors } from "kitva";
    
    
    
    ${forms
		.map((form) => {
			return `export function ${getExportName(form)}(opts={}) {
            const validate = createAjvValidateFn(actions_${form}, true);
        
            return createValidationClient({
                validate,
                getFormErrors,
                action: "${form}",
                form_id: "kitva-${randomBytes(2).toString("base64url")}",
                ...opts
            });
        };`;
		})
		.join("\n\n")}`;
}
