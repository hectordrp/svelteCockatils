<script>
import { Link } from "svelte-navigator";

    import Card from "../UI/Card.svelte";

    export let cocktailsStore;
    export let selectedItem;

    let cardImage =
        "https://i.pinimg.com/originals/59/9b/83/599b83ec328efed7750cac987a98b55b.jpg";
</script>

<section>
    {#each $cocktailsStore as cocktail}
        {#if cocktail.category && cocktail.category.find((cat) => {
                return cat === selectedItem;
            })}
            <Card {cardImage}>
                <div slot="card-header" class="card-header">
                    <Link to="/cocktail/{cocktail.id}">{cocktail.cocktailName}</Link>
                </div>
            </Card>
        {:else if selectedItem === "All"}
            <Card {cardImage}>
                <div slot="card-header" class="card-header">
                    <Link to="/cocktail/{cocktail.id}">{cocktail.cocktailName}</Link>
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
    /* .card-header span,
    .card-body span {
        text-align: left;
         padding: 0 1rem; 
    } */
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
