import { withValidation } from "kitva/forms/server";
import type { Actions } from "./$types2";
// import type { Actions } from "./$types";

export const actions: Actions = withValidation({
    default(event) {
        // if (!event.locals.validation.valid) {
        event.locals.validation.body.data;
        // }
        return {
            success: true,
        };
    },
    another_action(event) {},
    test(event) {
        //
    },
});
