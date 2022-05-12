<script>
	import Nav from './components/Nav.svelte';
	import Input from './components/Input.svelte';
	import Output from './components/Output.svelte';
	let title = 'Backtracker';
</script>

<header>
	<Nav {title}/>
</header>

<main>
	<Input />
	<Output />
</main>

<footer>

</footer>

<style>

	@media (min-width: 640px) {

	}
</style>