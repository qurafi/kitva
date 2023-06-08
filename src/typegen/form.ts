export function generate$formDts(form: string) {
    return `import { GeneratedValidationClient } from "kitva/forms/types";
import { AjvError } from "kitva/presets/ajv/index";
import { Schemas } from "../schema_types";

export const createValidate: GeneratedValidationClient<
    Schemas["actions"]["${form}"],
    AjvError
>;`;
}
