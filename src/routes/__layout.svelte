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
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		height: 60vh;
		font-size: 1.2em;
	}
</style>