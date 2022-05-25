<script>
	import Nav from '$lib/Nav.svelte';
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
	<footer>
		<div id='#created'>
			<a href="https://github.com/rossrobino" target="_blank">Created by Ross Robino</a>
		</div>
	</footer>
</div>
<style>
	main {
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		font-size: 1.2em;
	}
	footer {
		height: 3vw;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgb(0, 90, 128);
		color: white;
		margin-top: 3vw;
		padding: 1vw 0;
	}
	footer a {
		color: white;
		font-size: 1.5vw;
	}
	#wrapAll {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100vh;
	}
	@media (max-width: 640px) {
		footer {
			height: 10vw;
			padding: 3vw 0;
		}
		footer a {
			font-size: 4vw;
		}
	}
</style>