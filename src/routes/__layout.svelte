<script>
	import Nav from '$lib/Nav.svelte';
</script>

<header>
	<Nav/>
</header>

<main>
	<slot></slot>
</main>

<footer>

</footer>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2em;
	}
</style>