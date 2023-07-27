import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export function addDeps(cwd: string) {
	const pkg_path = resolve(cwd, "package.json");
	const content = readFileSync(pkg_path, "utf-8");
	const pkg = JSON.parse(content);

	pkg.dependencies = {
		...pkg.dependencies,
		kitva: "^1.0.0-next.0",
		"ajv-formats": "^3.0.0-rc.0",
		ajv: "^8"
	};

	writeFileSync(pkg_path, JSON.stringify(pkg, null, 2));
}
