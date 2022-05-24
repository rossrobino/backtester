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
		<div>
			Created by 
			<a href="https://robino.dev" target="_blank">
				Ross Robino
			</a>
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
		height: 10vw;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgb(0, 90, 128);
		color: white;
		margin-top: 3vw;
	}
	footer a {
		color: white;
	}
	#wrapAll {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100vh;
	}
</style>