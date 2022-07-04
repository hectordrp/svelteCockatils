<script>
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import url from "./libs/url";

	import Cocktails from "./cocktails/Cocktails.svelte";
	import HorizontalMenu from "./UI/HorizontalMenu.svelte";
	import Header from "./UI/Header.svelte";
	import CocktailItem from "./cocktails/CocktailItem.svelte";

	import { pageStateStore } from './cocktails/cocktails-store';

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
	
	$: document.body.classList.toggle('modalOpen', $pageStateStore.modalOpened);
</script>

<div class="topSectionHolder"></div>
<div class="topSection">
	<Header />
	<HorizontalMenu {menuItems} {selectedItem} on:click={changeMenuItem} />
</div>
<main class="modalOpen">
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
		z-index: 10;
	}

	.topSection {
		position: fixed;
        top: 0;
        background: #f6f6f6;
        z-index: 5;
		width: 100%;
	}

	.topSectionHolder {
		height: 5rem;
	}
</style>
