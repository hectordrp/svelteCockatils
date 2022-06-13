<script>
	import { useParams } from "svelte-navigator";

    import Card from "../UI/Card.svelte";
    
    

    const params = useParams();
    $: console.log("a", $params);
</script>

<Card>
    <div slot="card-header" class="card-header">
        <!-- {cocktail.cocktailName} -->
        test
    </div>
</Card>