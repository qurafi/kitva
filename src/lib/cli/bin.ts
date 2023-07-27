import { setup } from "./setup.js";
import { error } from "../utils/index.js";
import { parseArgs } from "node:util";

try {
	const { values } = parseArgs({
		options: {
			only: {
				type: "string",
				default: "types,hook,vite,deps"
			}
		}
	});

	await setup(process.cwd(), { steps: values.only!.split(/, */) });
} catch (e) {
	error("Failed to setup Kitva");
	console.error(e);
}
