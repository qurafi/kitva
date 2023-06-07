import { withValidation } from "kitva/forms/server";
import type { Actions } from "./$types";

export const actions: Actions = withValidation({
    default() {
        return { success: true };
    },
});
