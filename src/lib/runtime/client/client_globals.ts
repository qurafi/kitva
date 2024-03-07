import type {
	HTMLAttributes,
	HTMLFormAttributes,
	HTMLInputAttributes,
	HTMLLabelAttributes
} from "svelte/elements";
import InputRenderer from "./components/Input.svelte";
import type { CreateClientOption, GeneratedClientOptions } from "../../types/forms.js";

interface ComponentConfig {
	inputProps?: Record<string, any> & HTMLInputAttributes;
	labelProps?: Record<string, any> & HTMLLabelAttributes;
	errorProps?: Record<string, any> & HTMLAttributes<HTMLParagraphElement>;
	formProps?: Record<string, any> & HTMLFormAttributes;
	inputComponent?: typeof InputRenderer;
	instanceDefaults?:
		| GeneratedClientOptions
		| ((options: CreateClientOption) => GeneratedClientOptions);
}

const defaults: ComponentConfig = {
	inputComponent: InputRenderer
};

export let config: ComponentConfig = defaults;

/**
 * Set this before rendering. For example in layout
 */
export function setKitvaClientDefaults(new_defaults: ComponentConfig) {
	config = { ...defaults, ...new_defaults };
}
