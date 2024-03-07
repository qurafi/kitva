import type { HTMLAttributes, HTMLInputAttributes, HTMLLabelAttributes } from "svelte/elements";

export { default as Input } from "./InputWrapper.svelte";
export { default as Form } from "./Form.svelte";

export interface LabelProp {
	attrs: HTMLLabelAttributes;
	text: string;
}

export interface ErrorLabelProp {
	attrs: HTMLAttributes<HTMLParagraphElement>;
	text?: string;
}

export interface InputProp {
	attrs: HTMLInputAttributes;
}
