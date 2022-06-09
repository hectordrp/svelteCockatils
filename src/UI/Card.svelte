<script>
    export let cardImage;
    export let cardImgageAlt = "Card image";

</script>
<div class="card">
    <div class="cardImg">
        {#if cardImage}
            <img src={cardImage} alt={cardImgageAlt} />
        {/if}
    </div>
    <div class="card-header">
        <slot name="card-header" > </slot>
    </div>
    <div class="card-body">
        <slot name="card-body" ></slot>
    </div>
</div>