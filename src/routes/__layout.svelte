<script>
	import Nav from '$lib/Nav.svelte';
</script>

<header>
	<Nav/>
</header>

<main>
	<slot></slot>
</main>

<style>
	main {
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		font-size: 1.2em;
	}
</style>