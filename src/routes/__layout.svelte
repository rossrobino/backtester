<script>
	import Nav from '$lib/Nav.svelte';
	let title = 'Backtracker';
</script>

<header>
	<Nav {title}/>
</header>

<main>
	<slot></slot>
</main>

<footer>

</footer>

