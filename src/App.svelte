<script>
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import url from "./libs/url";

	import Cocktails from "./cocktails/Cocktails.svelte";
	import HorizontalMenu from "./UI/HorizontalMenu.svelte";
	import Header from "./UI/Header.svelte";
	import CocktailItem from "./cocktails/CocktailItem.svelte";

	import {
		cocktailsStore,
		ingredientsStore,
	} from "./cocktails/cocktails-store";

	fetch(
		"https://thecocktaildbapp-default-rtdb.europe-west1.firebasedatabase.app/cocktails.json"
	)
		.then((response) => response.json())
		.then((data) => {
			cocktailsStore.setCocktails(data);
		});

	fetch(
		"https://thecocktaildbapp-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json"
	)
		.then((response) => response.json())
		.then((data) => {
			ingredientsStore.setIngredients(data);
		});

	let menuItems = ["All", "Popular", "New", "Bartender's Choice"];
	let selectedItem = "All";

	function changeMenuItem(event) {
		selectedItem = event.target.innerText;
	}

</script>

<Header />
<HorizontalMenu {menuItems} {selectedItem} on:click={changeMenuItem} />
<main>
	<Cocktails {cocktailsStore} {selectedItem} />
</main>
{#if $url.hash.indexOf("cocktail") > 0}
	<div
		transition:fly={{
			delay: 0,
			duration: 500,
			x: 1000,
			y: 0,
			opacity: 0.5,
			easing: quintOut,
		}}
		class="overlay"
	>
		<CocktailItem/>
	</div>
{/if}

<style>
	* {
		font-family: "Roboto Slab", serif;
	}

	main {
		margin: 0 auto;
		max-width: 1200px;
		padding: 0 1rem;
		min-height: 60%;
	}
	.overlay {
		overflow-y: auto;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #fff;
		z-index: 1;
	}
</style>
