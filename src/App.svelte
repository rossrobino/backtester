<script>
	import Nav from './components/Nav.svelte';
	let title = 'Backtracker';
</script>

<header>
	<Nav {title}/>
</header>

<main>
	<table>
		<tr>
			<td>Ticker:</td>
			<td><input type="text"></td>
		</tr>
		<tr>
			<td>Principle:</td>
			<td><input type="number" min=0 ></td>
		</tr>
		<tr>
			<td>Start Date:</td>
			<td><input type="date"></td>
		</tr>
		<tr>
			<td>End Date:</td>
			<td><input type="date"></td>
		</tr>
	</table>
	test
</main>

<footer>

</footer>

<style>

	@media (min-width: 640px) {

	}
</style>