import { writable } from 'svelte/Store';

const cocktails = writable([]);
const ingredients = writable([]);
const searchTextBox = writable("");

const cocktailsStore = {
    subscribe: cocktails.subscribe,
    addCocktail: (cocktail) => {
        cocktails.update((cocktails) => {
            return [...cocktails, cocktail];
        });
    },
    setCocktails: items => {
        cocktails.set(items)
    }
}

const ingredientsStore = {
    subscribe: ingredients.subscribe,
    addIngredient: (ingredient) => {
        ingredients.update((ingredients) => {
            return [...ingredients, ingredient];
        });
    },
    setIngredients: items => {
        ingredients.set(items)
    }
}

const searchTextBoxStore = {
    subscribe: searchTextBox.subscribe,
    setSearch: text => {
        searchTextBox.set(text)
    }
}

export { ingredientsStore, cocktailsStore, searchTextBoxStore };