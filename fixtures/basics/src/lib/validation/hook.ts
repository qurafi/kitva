import schemas from "$schemas?t=all";

import { getValidationHook } from "kitva";

export const handle = getValidationHook(schemas);
