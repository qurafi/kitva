import { setup } from "./setup.js";
import { error } from "../runtime/server/utils/server.js";
import { parseArgs } from "node:util";

try {
	const { values } = parseArgs({
		options: {
			only: {
				type: "string",
				default: "types,hook,vite,deps,localize"
			}
		}
	});

	await setup(process.cwd(), { steps: values.only!.split(/, */) });
} catch (e) {
	error("Failed to setup Kitva");
	console.error(e);
}
