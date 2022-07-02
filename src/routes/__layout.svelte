<script>
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
</script>

<svelte:head>
	<title>Backtester</title>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
		body {
			margin: 0;
			font-family: 'Roboto', sans-serif;
		}
		::selection {
			color: white;
			background: rgb(112,105,253);
		}
	</style>
</svelte:head>

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
		height: 100dvh;
	}
</style>