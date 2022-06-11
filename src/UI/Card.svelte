<script>
    export let cardImage;
    // export let cardImgageAlt = "Card image";

</script>
<div class="card">
    {#if cardImage}
        <div class="cardImg" style="background-image: url({cardImage});"/>
    {/if}
    
    <slot name="card-header" class="card-header" > </slot>
    <slot name="card-body" class="card-body"> </slot>

</div>

<style>
    .card {
        
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