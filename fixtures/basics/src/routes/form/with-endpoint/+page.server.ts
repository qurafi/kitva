import { withValidation } from "kitva/forms/server";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";

export const actions: Actions = withValidation({
    default(event) {
        console.log(event.locals.validation);
        return { success: true };
    },
});
