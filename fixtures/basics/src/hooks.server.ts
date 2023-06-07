import schemas from "$schemas?t=all";

import { validationHook as getValidationHook } from "kitva/hook/index";
import { createPreset } from "kitva/presets/ajv/server";

console.log({ schemas });

export const preset = createPreset(schemas);

export const handle = getValidationHook(preset);
