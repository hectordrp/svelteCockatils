<script>
    export let menuItems = ["All"];
    export let selectedItem = "All";


</script>

<nav>
    <ul>
        {#each menuItems as menuItem}
            {#if menuItem === selectedItem}
                <li on:click class="selected">{menuItem}</li>
            {:else}
                <li on:click>{menuItem}</li>
            {/if}
        {/each}
    </ul>
</nav>

<style>
    nav {
        overflow-x: auto;
        white-space: nowrap;
    }
    nav > ul {
        display: flex;
        padding: 0;
        margin: 0;
        margin-bottom: 1rem;
    }
    nav > ul > li {
        color: var(--light-gray);
        list-style: none;
        padding: 0 1rem;
        font-weight: bold;
        cursor: pointer;
        font-size: 1rem;
    }
    nav > ul > li:hover {
        color: var(--text);
    }
    nav > ul > li:focus {
        outline: none;
        background: transparent;
    }
    nav > ul > li.selected {
        color: var(--text);
    }
</style>
