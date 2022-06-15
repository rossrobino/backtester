<script>
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<div id='wrapAll'>
	<div>
		<header>
			<Nav/>
		</header>
		<main>
			<slot></slot>
		</main>
	</div>
	<Footer/>
</div>

<style>
	main {
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		font-size: 1.2em;
	}
	#wrapAll {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100vh;
	}
</style>