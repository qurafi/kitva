export function generate$formDts(forms: string[]) {
	return `import { GeneratedValidationClient } from "kitva/forms/types";
import { AjvError } from "kitva/presets/ajv/index";
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
    
    import { createValidationClient } from "kitva/forms/client";
    
    import { createValidateFn, getFormErrors } from "kitva/presets/ajv/index";
    
    
    ${forms
		.map((form) => {
			return `export function ${getExportName(form)}(opts={}) {
            const validate = createValidateFn(actions_${form}, true);
        
            return createValidationClient({
                validate,
                getFormErrors,
                action: "${form}",
                ...opts
            });
        };`;
		})
		.join("\n\n")}`;
}
