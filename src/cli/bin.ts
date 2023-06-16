import { setup } from "./setup.js";
import { error } from "../utils/index.js";
import { parseArgs } from "node:util";

try {
	// const args = parseArgs(["only"]);
	const { values } = parseArgs({
		options: {
			only: {
				type: "string",
				default: "types,hook,vite"
			}
		}
	});

	await setup(process.cwd(), { steps: values.only!.split(/, */) });
} catch (e) {
	error("failed to setup kitva", e);
}

// export function parseArgs(known_args: string[]) {
// return Object.fromEntries([..."--arg=1 --two=22 hello --world".matchAll(/--([^=]+)([^ ]*)/g)])
// return Object.fromEntries(
// 	process.argv.slice(2).map((arg) => {
// 		const match = arg.match(/--([^=]+)([^ ]*)/);
// 		if (!match) {
// 			error("invalid arg ", arg);
// 			return [];
// 		}
// 		if (!known_args.includes(match[1])) {
// 			error("unknown arg", match[1]);
// 			return [];
// 		}

// 		return [match[1], match[2] || true];
// 	})
// );
// }
