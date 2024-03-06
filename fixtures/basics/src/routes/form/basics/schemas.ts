import { Type as t } from "@sinclair/typebox";

export const actions = {
	default_action: t.Object({
		username: t.String({ minLength: 1, maxLength: 10, errorMessage: "username.invalid" }),
		email: t.String({
			minLength: 1,
			format: "email",
			maxLength: 30,
			errorMessage: {
				format: "email is not valid"
			}
		}),
		password: t.String({
			minLength: 6,
			maxLength: 128
		}),
		first_name: t.String({ minLength: 1 }),
		last_name: t.Optional(t.String()),
		accept_tos: t.Optional(t.Boolean({ default: false }))
	}),
	another_action: t.Object({
		foo: t.String({ format: "email", minLength: 1, maxLength: 10 }),
		bar: t.String({ format: "date-time", maxLength: 10 })
	})
};
