import { withValidation } from "kitva/forms/server";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types2";

export const actions: Actions = withValidation({
    default(event) {
        console.log(event.locals.validation);
        return { success: true };
    },
});
