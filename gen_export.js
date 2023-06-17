import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const exports = pkg.exports;

function genDeclareModule(module, types, imprt) {
	return `declare module '${pkg.name}/${module}' {export * from '${pkg.name}/${imprt.slice(2)}'}`;
}

if (exports) {
	let typesVersions = {};
	let modules = [];
	for (const [_name, { types, import: imprt }] of Object.entries(exports)) {
		if (types && _name != ".") {
			const mod = _name.slice(2);
			const typs = types.slice(2);
			typesVersions[mod] = [typs];
			modules.push(genDeclareModule(mod, typs, imprt));
		}
	}

	console.log(JSON.stringify(typesVersions, null, 2));
}
