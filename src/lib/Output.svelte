<script>
    import { submitted, success, symbol, startPrice, endPrice, startDate, endDate, rateOfReturn } from '../stores';
</script>

<div class="lineBreak"></div>

{#if ($submitted)}
    {#if ($success)}
        <table>
            <tr>
                <td>Ticker:</td>
                <td>{$symbol}</td>
            </tr>
            <tr>
                <td>{$startDate} Close:</td>
                <td>{$startPrice}</td>
            </tr>
            <tr>
                <td>{$endDate} Close:</td>
                <td>{$endPrice}</td>
            </tr>
            <tr>
                <td>Buy and hold RoR:</td>
                <td>{$rateOfReturn}%</td>
            </tr>
        </table>
    {:else}
        Loading...
    {/if}   
{/if}

<style>
    .lineBreak {
        flex-basis: 100%;
        height: 10vh;
    }
</style>