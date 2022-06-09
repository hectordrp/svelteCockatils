<script>
import Card from "../UI/Card.svelte";

export let cocktailsStore;
export let selectedItem;
    

</script>

<section>

    {#each  $cocktailsStore as cocktail }
        {#if cocktail.category && cocktail.category.find(cat => { return cat === selectedItem })}
            <Card > 
                <div slot="card-header">{cocktail.cocktailName}</div>
                <div slot="card-body">{cocktail.category}</div>
            </Card>
        {:else if selectedItem === "All"}
            <Card>
                <div slot="card-header">{cocktail.cocktailName}</div>
                <div slot="card-body">{cocktail.category}</div>
            </Card>
        {/if}
    {/each}

</section>
