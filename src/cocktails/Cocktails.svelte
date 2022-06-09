<script>


export let cocktailsStore;
export let selectedItem;
    

</script>

<section>

    {#each  $cocktailsStore as cocktail }
        {#if cocktail.category && cocktail.category.find(cat => { return cat === selectedItem })}
            <div class="card">{cocktail.cocktailName}</div>
        {:else if selectedItem === "All"}
            <div class="card">{cocktail.cocktailName}</div>
        {/if}
    {/each}

</section>
