<script>
    import { createEventDispatcher } from 'svelte';

    export let cardImage;
    export let minImgHeight = "100px";
    export let goBackBtn = false;

    // export let cardImgageAlt = "Card image";

    const dispatch = createEventDispatcher();

    function goBack () {
        dispatch('goBack', {});
    }

    function dispatchCardClick() {
        dispatch('cardClick', {});
    }



</script>
<div class="card" on:click={dispatchCardClick}>
    {#if cardImage}
        {#if goBackBtn}
            <button class="btn goBackBtn" on:click={goBack}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="Gray" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"/></svg>
            </button>
        {/if}
        <div class="cardImg"  style='background-image: url("{cardImage}"); min-height:{minImgHeight};'/>
    {/if}
    
    <slot name="card-header" class="card-header" > </slot>
    <slot name="card-body" class="card-body"> </slot>

</div>

<style>
    .goBackBtn {
        position: absolute;
        top: 10px;
        left: 10px;
        border: none;
        border-radius: 15%;
        padding: 3px 6px;
        box-sizing: border-box;
        line-height: 0.5rem;
        
    }
    .goBackBtn svg {
        width: 0.5rem;        
    }

    .card {
        position: relative;
        border-radius: 10px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        transition: 0.3s;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100px;
        padding-bottom: 1rem;
    }
    .card:hover {
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
    }
    .cardImg {
        min-height: 100px;
        width: 100%;
        height: 100%;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        border-radius: 10px 10px 0px 0px;
    }

    @media (min-width: 768px) {
        .cardImg {
            min-height: 300px;
        }
    }
</style>