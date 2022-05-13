<script>
    import { submitted, success, symbol, startPrice, endPrice, startDate, endDate, rateOfReturn } from '../stores';
</script>

{#if ($submitted)}
    {#if ($success)}
        <table>
            <tr>
                <th>Ticker:</th>
                <td>{$symbol}</td>
                
                
                
            </tr>
            <tr>
                <th>{$startDate} Close:</th>
                <td>{$startPrice}</td>
            </tr>
            <tr>
                <th>{$endDate} Close:</th>
                <td>{$endPrice}</td>
                
            </tr>
            <tr>
                <th>Buy and hold RoR:</th>
                <td>{$rateOfReturn}%</td>
            </tr>
        </table>
    {:else}
        <p>loading...</p>
    {/if}   
{/if}