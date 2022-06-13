<script>
	import Cocktails from "./cocktails/Cocktails.svelte";
	import HorizontalMenu from "./UI/HorizontalMenu.svelte";
	import Header from "./UI/Header.svelte";
	import { Router, Route } from "svelte-navigator";

	import { cocktailsStore, ingredientsStore } from "./cocktails/cocktails-store";
import CocktailItem from "./cocktails/cocktailItem.svelte";

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
<HorizontalMenu {menuItems} {selectedItem} on:click={changeMenuItem}/>
<main > 
	<!-- <Cocktails {cocktailsStore} {selectedItem}/> -->
	<Router>
		<Route path="/" component={Cocktails} {cocktailsStore} {selectedItem}/>
		<Route path="/cocktail/:id" component={CocktailItem}  {cocktailsStore} {selectedItem}/>
	</Router>
</main>


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
</style>
