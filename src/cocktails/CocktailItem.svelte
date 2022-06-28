<script>
    import Card from "../UI/Card.svelte";
    import { cocktailsStore } from "./cocktails-store";

    let cocktail = {};

    // $: cocktail = $cocktailsStore[0];

    //url: #/cocktail/{cocktail.id}
    let url = new URL(window.location.href);
    let id = url.hash.split("/")[url.hash.indexOf("cocktail")];

    let cardImage =
        "https://i.pinimg.com/originals/59/9b/83/599b83ec328efed7750cac987a98b55b.jpg";

    if (!cocktailsStore || cocktailsStore.length === 0) {
        window.location.href = "/";
    }
    if (id) {
        cocktail = $cocktailsStore.find((item) => {
            return item.id == id;
        });
        if (!cocktail) {
            window.location.href = "/";
        }
    }

    function goBack() {
        location.href="#/";
    }
</script>

{#if cocktail}
    <div class="container">
    
        <section>
            <Card cardImage={cocktail.imageUrl ? cocktail.imageUrl : cardImage} on:goBack={goBack} minImgHeight={"300px"} goBackBtn={"/"}>
                <div slot="card-header" class="card-header">
                    {cocktail.cocktailName}
                </div>
                <div slot="card-body" class="card-body">
                    <h2>Recipes</h2>
                    <!-- {#each cocktail.recipes as recipe} -->
                        <p>{cocktail.recipes[0]}</p>
                        
                    <!-- {/each} -->
                </div>
            </Card>
        </section>
    </div>
{/if}

<style>
    section {
        display: grid;
        grid-template-columns: minmax(100px, 1fr);
        grid-gap: 1rem;
        margin: 2rem auto;
    }

    .container {
        margin: 0 auto;
        max-width: 800px;
        padding: 0 1rem;
        min-height: 60%;
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

