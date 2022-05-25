<script>
    import { submitted, success, symbol, startPrice, endPrice, startDate, endDate, rateOfReturn, tradeList } from '../stores';
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

        
            <table>
                <tr>
                    <th>Date</th>
                    <th>Previous Close</th>
                    <th>Today's Close</th>
                    <th>Change</th>
                    <th>In/Out</th>
                    <th>Amount</th>
                    <th>Action</th>
                </tr>
                {#each $tradeList as trade}
                <tr>
                    <td>{trade.date}</td>
                    <td>{trade.previousClose}</td>
                    <td>{trade.todayClose}</td>
                    <td>{trade.percentChange}%</td>
                    <td>{trade.invested ? "In" : "Out"}</td>
                    <td>${trade.amount}</td>
                    <td>{trade.outcome}</td>
                </tr>{/each}
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