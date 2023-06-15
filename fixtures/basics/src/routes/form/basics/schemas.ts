import { Type as t } from "@sinclair/typebox";

export const actions = {
	default_action: t.Object(
		{
			username: t.String({ minLength: 1, maxLength: 16 }),
			email: t.String({
				minLength: 1,
				format: "email",
				maxLength: 30,
				errorMessage: {
					format: "email is not valid"
				}
			}),
			first_name: t.String({ minLength: 1 }),
			last_name: t.Optional(t.String()),
			accept_tos: t.Optional(t.Boolean({ default: false }))
		},
		{
			additionalProperties: false
		}
	),
	another_action: t.Object({
		foo: t.String({ minLength: 1, format: "email" }),
		bar: t.String({ format: "date-time" })
	}),

	// test type=object warning
	test: t.String({
		title: "MyTest"
	})
};
