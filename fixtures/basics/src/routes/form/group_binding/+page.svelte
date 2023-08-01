<script>
	import { createDefaultForm } from "./$form.js";

	const default_form = createDefaultForm();

	const { errs } = default_form;

	export let form;
</script>

<form method="post">
	<fieldset>
		<legend>Interests:</legend>
		<label>
			<span>Coding</span>
			<input type="checkbox" name="interests" value="coding" />
		</label>
		<label>
			<span>Music</span>
			<input type="checkbox" name="interests" value="music" />
		</label>
		<span style:color="red">{$errs.interests || ""}</span>
	</fieldset>
	<button>Submit</button>
	<pre>{JSON.stringify(form, null, 2)}</pre>
</form>

<style>
	label {
		display: block;
	}
</style>
