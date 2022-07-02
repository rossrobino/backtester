<!--
    references: 

    Simple Responsive Table in CSS
    Matt Smith
    5/26/22
    https://codepen.io/AllThingsSmitty/pen/MyqmdM 

    https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
    6/17/22
    by: adeneo

    Rounding Decimals in JavaScript
    Jack Moore
    5/26/22
    https://www.jacklmoore.com/notes/rounding-in-javascript/ 
-->

<script>
    import { colorList, endDate, endPrice, entry, entryId, error, rateOfReturn, startDate, startPrice, strategy, optimized, portfolio, submitted, success, symbol, tradeList  } from '../stores';
    import { fade, fly } from 'svelte/transition';
    import Switch from '$lib/Switch.svelte';
    import Chart from '$lib/Chart.svelte';
    import Fa from 'svelte-fa/src/fa.svelte';
    import { faArrowTrendUp,faFolderPlus, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons/index.es';
    import BubbleChart from './BubbleChart.svelte';

    let showAllData = false;
    const fadeParameters = { duration: 400 };

    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    function randomColor() {
        return 'rgb(' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ')';
    }

    function entryCheck(entry, portfolio) {
        for (let i = 0; i < portfolio.length; i++) {
            if (portfolio[i] === entry) {
                return true
            }
        }
        return false;
    }

    function addEntry() {
        if (!entryCheck($entry, $portfolio)) {
            $portfolio.push($entry);
            $portfolio = $portfolio;
            $entryId++;
            $colorList.push(randomColor());
        }
    }
    function removeEntry() {
        if ($entryId > 0) {
            if ($entryId > 1) {
                $colorList.pop();
                $entryId--;
            }
            $portfolio.pop();
            $entry.id = $entryId;
        }
    }
</script>

<!-- if statement manages the loading message -->
{#if ($submitted)}
    {#if ($success && $error === '')}
        {#if ($tradeList.length === 0)}
            <p>Please select a new date.</p>
        {:else}
            <table class='chartTable' in:fade="{fadeParameters}">
                <!-- <caption>Comparison</caption> -->
                <tbody>
                    {#key $entry}
                        <tr>
                            <Chart />
                        </tr>
                    {/key}
                    <tr>
                        <td>
                            {#if ($portfolio.length === 0)}       
                                <button on:click={addEntry}><Fa icon={faFolderPlus}/> CREATE PORTFOLIO</button>
                            {:else}
                                <button on:click={removeEntry}><Fa icon={faMinus}/> REMOVE</button>
                                {#if !entryCheck($entry, $portfolio)}
                                    <button on:click={addEntry}><Fa icon={faPlus}/> ADD</button>
                                {/if}
                            {/if}
                        </td>
                    </tr> 
                </tbody>
            </table>
            {#if $optimized}
                <table class='chartTable' id='bubble' in:fly="{{ y: -100, duration: 400 }}">
                    <tbody>
                        <tr>
                            <BubbleChart />
                        </tr>
                    </tbody>
                </table>
            {/if}
            <table in:fade="{fadeParameters}">
                <thead>
                    <tr>
                        <th scope="col">Strategy  - {$symbol}</th>
                        <th scope="col">{$startDate}</th>
                        <th scope="col">{$endDate}</th>
                        <th scope="col">Return</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td data-label="Strategy">Buy and Hold</td>
                        <td data-label='{$startDate}'>${round($startPrice,2)}</td>
                        <td data-label='{$endDate}'>${round($endPrice, 2)}</td>
                        <td data-label="Return">{$rateOfReturn}%</td>
                    </tr>
                    <tr>
                        <td data-label="Strategy">Current</td>
                        <td data-label='{$startDate}'>${round($startPrice,2)}</td>
                        <td data-label='{$endDate}'>${$tradeList[$tradeList.length-1].amount}</td>
                        <td data-label="Return">{round((($tradeList[$tradeList.length-1].amount)-$startPrice)/$startPrice*100, 2)}%</td>
                    </tr>
                </tbody>
            </table>
            {#if ($portfolio.length > 0)}
                <table transition:fly="{{ y: -50, duration: 400 }}" id='portfolio'>
                    <caption>Portfolio</caption>
                    {#if ($portfolio.length > 0)}
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Ticker</th>
                                <th scope="col">Start</th>
                                <th scope="col">End</th>
                                <th scope="col">Time Frame</th>
                                <th scope="col">Strategy</th>
                                <th scope="col">Buy</th>
                                <th scope="col">Sell</th>
                                <th scope="col">Start Invested</th>
                                <th scope="col">Return</th>
                            </tr>
                        </thead>
                    {/if}
                    <tbody>
                        {#key $entry}
                            {#each $portfolio as entry}
                                <tr>
                                    <td data-label="#" style="color: {entry.color};">
                                        {entry.id} 
                                        <Fa icon={faArrowTrendUp}/>
                                    </td>
                                    <td data-label="Ticker">{entry.ticker}</td>
                                    <td data-label="Start">{entry.startPrice}</td>
                                    <td data-label="End">{entry.endPrice}</td>
                                    <td data-label="Time Frame">{entry.timeFrame}</td>
                                    <td data-label="Strategy">{entry.strategyType}</td>
                                    <td data-label="Buy">{entry.buy}%</td>
                                    <td data-label="Sell">{entry.sell}%</td>
                                    <td data-label="Start Invested">{entry.startInvested}</td>
                                    <td data-label="Return">{entry.return}%</td>
                                </tr>
                            {/each}
                        {/key}
                        <tr>
                            <td colspan="10">
                                <button on:click={removeEntry}><Fa icon={faMinus}/> REMOVE</button>
                                {#if !entryCheck($entry, $portfolio)}
                                    <button on:click={addEntry}><Fa icon={faPlus}/> ADD</button>
                                {/if}
                            </td>
                        </tr>  
                    </tbody>
                </table>
            {/if}
            <table id="summaryTable" in:fade="{fadeParameters}">
                <caption>Summary</caption>
                    <tr>
                        <th class='hidden' colspan="4"></th>
                        <th class='hidden'>{showAllData ? 'All' : 'Trades'}</th>
                        <td data-label="{showAllData ? 'All' : 'Trades'}"><Switch bind:checked={showAllData} /></td>
                    </tr>  
            </table>
            <table in:fade="{fadeParameters}">
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
        <p></p>
    {/if}
{:else}
    <p>
        Compare buying and holding to trading on volatility.
        Backtester is not meant to predict future performance.
    </p>
{/if}

<style>
    button {
        height: 2.6rem;
        width: 35%;
        background-color: rgb(112,105,253);
        border-radius: 3px;
        color: white;
        border: none;
    }
    button:hover {
        cursor: pointer;
    }
    p {
        margin: 1rem;
        text-align: center;
        font-size: .8rem;
    }
    table {
        border-collapse: collapse;
        width: 100%;
        min-width: 0;
        table-layout: fixed;
        letter-spacing: .09rem;
        margin: 1rem;
    }
    table caption {
        font-size: 1rem;
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
    .chartTable, #summaryTable {
        margin-bottom: 1rem;
        margin-top: 1.5rem;
    }
    .chartTable tr {
        border-bottom: none;
    }

    #portfolio thead tr th {
        font-size: .8rem;
    }

    @media screen and (max-width: 640px) {
        table thead, .hidden {
            height: 1px;
            width: 1px;
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

        .chartTable td:last-child {
            border: none;
        }

        #summaryTable {
            margin-bottom: 0;
        }
        #bubble {
            margin-top: 0;
        }
    }
</style>