<script>
    import { submitted, success, symbol, startPrice, endPrice } from '../stores';
</script>

{#if ($submitted)}
    {#if ($success)}
        <p>symbol: {$symbol}</p>   
        <p>startPrice: {$startPrice}</p>   
        <p>endPrice: {$endPrice}</p>   
    {:else}
        <p>loading...</p>
    {/if}   
{/if}