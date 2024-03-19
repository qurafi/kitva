import createDebugger from "debug";

export const createDebug = (ns: string) => createDebugger(`kitva:${ns}`);
