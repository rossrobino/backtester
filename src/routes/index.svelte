<script>
	import Input from '$lib/Input.svelte';
	import Output from '$lib/Output.svelte';
</script>

<svelte:head>
	<title>Backtester</title>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono&display=swap');
		body {
			margin: 0;
			font-family: 'Ubuntu Mono', monospace;	
		}
	</style>
</svelte:head>

<Input />
<Output />