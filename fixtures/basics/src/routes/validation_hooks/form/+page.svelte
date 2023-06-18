<script>
	export let form;
</script>

<pre>{JSON.stringify(form, null, 2)}</pre>
<form autocomplete="off" method="post">
	<input type="text" name="username" />
	<input type="password" name="password" />
	<button>Submit</button>
</form>
