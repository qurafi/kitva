import type { HTMLAttributes, HTMLInputAttributes, HTMLLabelAttributes } from "svelte/elements";

interface ComponentConfig {
	inputProps?: Record<string, any> & HTMLInputAttributes;
	labelProps?: Record<string, any> & HTMLLabelAttributes;
	errorProps?: Record<string, any> & HTMLAttributes<HTMLParagraphElement>;
}

export let config: ComponentConfig = {};

/**
 * Set this before rendering. For example in layout
 */
export function setKitvaComponentDefaults(defaults: ComponentConfig) {
	config = defaults;
}
