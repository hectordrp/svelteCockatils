<script>
	import Cocktails from "./cocktails/Cocktails.svelte";
	import HorizontalMenu from "./UI/HorizontalMenu.svelte";
	import Header from "./UI/Header.svelte";

	import { cocktailsStore, ingredientsStore } from "./cocktails/cocktails-store";

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
<main > 
	<HorizontalMenu {menuItems} {selectedItem} on:click={changeMenuItem}/>
	<Cocktails {cocktailsStore} {selectedItem}/>

</main>

<style>
	* {
		font-family: "Roboto Slab", serif;
	}
</style>
