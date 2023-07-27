import createDebugger from "debug";
import { bold, red, yellow } from "kleur/colors";
import { delayed } from "./index.js";

export const createDebug = (ns: string) => createDebugger(`kitva:${ns}`);

export function warn(msg: string, ...args: any[]) {
	console.warn(`${bold(yellow("warn:"))} ${msg}`, ...args);
}

export function error(msg: string, ...args: any[]) {
	console.error(`${bold(red("ERROR:"))} ${msg}`, ...args);
}

const LOG_MS = 200;
export const defer_warn = delayed(LOG_MS, warn);
export const defer_error = delayed(LOG_MS, error);
