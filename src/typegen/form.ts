export function generate$formDts(forms: string[]) {
	return `import { GeneratedValidationClient } from "kitva/forms/types";
import { AjvError } from "kitva/presets/ajv/index";
import { Schemas } from "./schema_types";

${forms
	.map((form) => {
		return `export const ${camelCase(`create_${form}`)}: GeneratedValidationClient<
    Schemas["actions"]["${form}"],
    AjvError
>;`;
	})
	.join("\n\n")}`;
}

function camelCase(s: string) {
	return s.replace(/(_\w)/g, (str) => str[1].toUpperCase());
}

export function generateClientCode(schema_import: string, forms: string[]) {
	return `import { ${forms.map((form) => `actions_${form}`).join(", ")} } from "${schema_import}";
    
    import { createValidationClient } from "kitva/forms/client";
    
    import { createValidateFn, getFormErrors } from "kitva/presets/ajv/index";
    
    
    ${forms
		.map((form) => {
			return `let i_${form} = 0;
        export function ${camelCase(`create_${form}`)}(opts) {
            const validate = createValidateFn(actions_${form}, true);
        
            return createValidationClient(
                validate,
                "${form}",
                opts.fields,
                getFormErrors,
                true,
                i_${form}++,
                opts.use_enhance
            );
        };`;
		})
		.join("\n\n")}`;
}
