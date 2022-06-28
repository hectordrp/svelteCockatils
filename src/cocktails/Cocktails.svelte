<script>
    import Card from "../UI/Card.svelte";

    import {searchTextBoxStore} from './cocktails-store';

    export let cocktailsStore;
    export let selectedItem;

    let cardImage =
        "https://i.pinimg.com/originals/59/9b/83/599b83ec328efed7750cac987a98b55b.jpg";
</script>

<section>
    {#each $cocktailsStore as cocktail}
        {#if cocktail.category 
          && cocktail.category.find((cat) => { return cat === selectedItem; }) 
          && (`${JSON.stringify(cocktail.recipes)}`.toUpperCase().includes($searchTextBoxStore.toUpperCase()) || cocktail.cocktailName.toUpperCase().includes($searchTextBoxStore.toUpperCase()))}
            <Card {cardImage} on:cardClick={location.href="#/cocktail/"+cocktail.id}>
                <div slot="card-header" class="card-header">
                    <span>{cocktail.cocktailName}</span>
                </div>
            </Card>
        {:else if selectedItem === "All" 
           && ( `${JSON.stringify(cocktail.recipes)}`.toUpperCase().includes($searchTextBoxStore.toUpperCase()) || cocktail.cocktailName.toUpperCase().includes($searchTextBoxStore.toUpperCase()))}
            <Card {cardImage} on:cardClick={location.href="#/cocktail/"+cocktail.id}>
                <div slot="card-header" class="card-header">
                    <span href="#/cocktail/{cocktail.id}">{cocktail.cocktailName}</span>
                </div>
            </Card>
        {/if}
    {/each}
</section>

<style>
    section {
        display: grid;
        grid-template-columns: minmax(100px, 1fr) minmax(100px, 1fr);
        grid-gap: 1rem;
        margin: 2rem auto;
    }

    .card-header {
        box-sizing: content-box;
        font-size: 1.1rem;
        font-weight: bold;
        text-align: left;
        display: block;
        word-wrap: break-word;
        overflow-wrap: break-word;
        display: block;
        padding: 0 1rem;
    }
    a,
    a:visited {
        text-decoration: none;
        color:black;
    }
    .card-body {
        box-sizing: content-box;
        font-size: 1rem;
        text-align: left;
        display: block;
        word-wrap: break-word;
        overflow-wrap: break-word;
        display: block;
        padding: 0 1rem;

    }
</style>
