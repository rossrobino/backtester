<!--
    table styles from:
    Simple Responsive Table in CSS
    Matt Smith
    5/26/22
    https://codepen.io/AllThingsSmitty/pen/MyqmdM 
-->

<script>
    import { endDate, endPrice, error, rateOfReturn, startDate, startPrice, strategy, submitted, success, symbol, tradeList } from '../stores';
    import Switch from '$lib/Switch.svelte';
    import Chart from '$lib/Chart.svelte';

    let showAllData = false;
    /*
        round function from:
        Rounding Decimals in JavaScript
        Jack Moore
        5/26/22
        https://www.jacklmoore.com/notes/rounding-in-javascript/ 
    */
    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }
</script>

<!-- if statement manages the loading message -->
{#if ($submitted)}
    {#if ($success && $error === '')}
        {#if ($tradeList.length === 0)}
            <p>No trades were completed.</p>
        {:else}
            <table id='chartTable'>
                <caption>Comparison</caption>
                <tbody>
                    <tr>
                        <Chart /> 
                    </tr>
                </tbody>
            </table>
            <table>
                <thead>
                    <tr>
                        <th scope="col">Strategy</th>
                        <th scope="col">{$startDate}</th>
                        <th scope="col">{$endDate}</th>
                        <th scope="col">Return</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td data-label="Strategy">Buy and Hold</td>
                        <td data-label='{$startDate}'>{round($startPrice,2)}</td>
                        <td data-label='{$endDate}'>{round($endPrice, 2)}</td>
                        <td data-label="Return">{$rateOfReturn}%</td>
                    </tr>
                    <tr>
                        <td data-label="Strategy">Volatility</td>
                        <td data-label='{$startDate}'>{round($startPrice,2)}</td>
                        <td data-label='{$endDate}'>{$tradeList[$tradeList.length-1].amount}</td>
                        <td data-label="Return">{round((($tradeList[$tradeList.length-1].amount)-$startPrice)/$startPrice*100, 2)}%</td>
                    </tr>
                </tbody>
            </table>
            <table id="summaryTable">
                <caption>Summary</caption>
                    <tr>
                        <th class='hidden' colspan="4"></th>
                        <th class='hidden'>{showAllData ? 'All' : 'Trades'}</th>
                        <td data-label="{showAllData ? 'All' : 'Trades'}"><Switch bind:checked={showAllData} /></td>
                    </tr>  
            </table>
            <table>
                <thead>
                    <tr>
                        <th scope="col">Date</th>
                        {#if ($strategy.type === 'PRICE')}
                            <th scope="col">Previous Close</th>
                            <th scope="col">Close</th>
                            <th scope="col">Price Change</th>
                        {/if}
                        
                        {#if ($strategy.type === 'VOLUME')}
                            <th scope="col">Previous Volume</th>
                            <th scope="col">Volume</th>
                            <th scope="col">Volume Change</th>
                        {/if}
                        <th scope="col">Amount</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- loops through tradeList of trades and creates a new row for each -->
                    {#each $tradeList as trade}
                        {#if (showAllData)}
                            <tr>
                                <td data-label="Date">{trade.date}</td>
                                {#if ($strategy.type === 'PRICE')}
                                    <td data-label="Previous Close">{round(trade.previousClose,2)}</td>
                                    <td data-label="Close">{round(trade.todayClose,2)}</td>
                                    <td data-label="Price Change">{trade.percentChangePrice}%</td>
                                {/if}
                                {#if ($strategy.type === 'VOLUME')}
                                    <td data-label="Previous Volume">{trade.previousVolume}</td>
                                    <td data-label="Volume">{trade.todayVolume}</td>
                                    <td data-label="Volume Change">{trade.percentChangeVol}%</td>
                                {/if}
                                <td data-label="Amount">${trade.amount}</td>
                                <td data-label="Action">{trade.outcome}</td>
                            </tr>
                        {:else}
                            {#if (trade.outcome === 'BUY' || trade.outcome === 'SELL')}
                                <tr>
                                    <td data-label="Date">{trade.date}</td>
                                    {#if ($strategy.type === 'PRICE')}
                                        <td data-label="Previous Close">{round(trade.previousClose,2)}</td>
                                        <td data-label="Close">{round(trade.todayClose,2)}</td>
                                        <td data-label="Price Change">{trade.percentChangePrice}%</td>
                                    {/if}
                                    {#if ($strategy.type === 'VOLUME')}
                                        <td data-label="Previous Volume">{trade.previousVolume}</td>
                                        <td data-label="Volume">{trade.todayVolume}</td>
                                        <td data-label="Volume Change">{trade.percentChangeVol}%</td>
                                    {/if}
                                    <td data-label="Amount">${trade.amount}</td>
                                    <td data-label="Action">{trade.outcome}</td>
                                </tr>
                            {/if}
                        {/if}
                    {/each}
                </tbody>
            </table>
        {/if}
    {:else if ($error !== '')}
        <p>{$error}</p>
    {:else}
        <p>Loading...</p>
    {/if}
{:else}
    <p>
        Compare buying and holding to trading on volatility.
        Backtester is not meant to predict future performance.
    </p>
{/if}

<style>
    p {
        margin: 1rem;
        text-align: center;
        font-size: .8rem;
    }
    table {
        border-collapse: collapse;
        width: 95vw;
        table-layout: fixed;
        letter-spacing: .09rem;
        margin: 1rem;
    }
    table caption {
        font-size: 1.3rem;
        margin: .6rem 0;
        color: rgb(112,105,253);
    }
    table tr {
        border-bottom: 1px solid #ddd;
    }
    table th, table td {
        padding: .5rem;
        text-align: center;
    }
    table th {
        font-size: .9rem;
        font-weight: normal; /* firefox */
    }
    table td {
        font-size: .8rem;
        color: #555;
        letter-spacing: 0;
    }
    #chartTable, #summaryTable {
        margin-bottom: 1rem;
        margin-top: 1.5rem;
    }
    #chartTable tr {
        border-bottom: none;
    }

    @media screen and (max-width: 640px) {
        table thead, .hidden {
            height: 1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
        }
        table tr {
            display: block;
            margin-bottom: .625em;
        }
        table td {
            border-bottom: 1px solid #ddd;
            display: block;
            text-align: right;
        }
        table td::before {
            content: attr(data-label);
            letter-spacing: .09rem;
            float: left;
            color: black;
        }
        table td:last-child {
            border-bottom: 2px solid #ddd;
        }
        #summaryTable {
            margin-bottom: 0;
        }
    }
</style>