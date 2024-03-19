import { delayed } from "$lib/shared/utils.js";
import { bold, red, yellow } from "kleur/colors";

export function warn(msg: string, ...args: any[]) {
	console.warn(`${bold(yellow("warn:"))} ${msg}`, ...args);
}

export function error(msg: string, ...args: any[]) {
	console.error(`${bold(red("ERROR:"))} ${msg}`, ...args);
}

const LOG_MS = 200;
export const defer_warn = delayed(LOG_MS, warn);
export const defer_error = delayed(LOG_MS, error);
