import type {
	HTMLAttributes,
	HTMLFormAttributes,
	HTMLInputAttributes,
	HTMLLabelAttributes
} from "svelte/elements";
import InputRenderer from "./Input.svelte";

interface ComponentConfig {
	inputProps?: Record<string, any> & HTMLInputAttributes;
	labelProps?: Record<string, any> & HTMLLabelAttributes;
	errorProps?: Record<string, any> & HTMLAttributes<HTMLParagraphElement>;
	formProps?: Record<string, any> & HTMLFormAttributes;
	inputComponent?: typeof InputRenderer;
}

export let config: ComponentConfig = {
	inputComponent: InputRenderer
};

/**
 * Set this before rendering. For example in layout
 */
export function setKitvaComponentDefaults(defaults: ComponentConfig) {
	config = defaults;
}
