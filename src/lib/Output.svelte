<script>
    import { endDate, endPrice, error, rateOfReturn, startDate, startPrice, submitted, success, symbol, tradeList } from '../stores';

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
            No trades were completed.
        {:else}
            <table>
                <caption>Comparison - {$symbol}</caption>
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
                        <td data-label="Strategy">Price Volatility</td>
                        <td data-label='{$startDate}'>{round($startPrice,2)}</td>
                        <td data-label='{$endDate}'>{$tradeList[$tradeList.length-1].amount}</td>
                        <td data-label="Return">{round((($tradeList[$tradeList.length-1].amount)-$startPrice)/$startPrice*100, 2)}%</td>
                    </tr>
                </tbody>
            </table>
            <table>
                <caption>Trade Summary</caption>
                <thead>
                    <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Previous Day Close</th>
                        <th scope="col">Close</th>
                        <th scope="col">Change</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- loops through tradeList of trades and creates a new row for each -->
                    {#each $tradeList as trade}
                        <tr>
                            <td data-label="Date">{trade.date}</td>
                            <td data-label="Previous Day Close">{round(trade.previousClose,2)}</td>
                            <td data-label="Close">{round(trade.todayClose,2)}</td>
                            <td data-label="Change">{trade.percentChange}%</td>
                            <td data-label="Amount">${trade.amount}</td>
                            <td data-label="Action">{trade.outcome}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    {:else if ($error !== '')}
        <p>Error- {$error}</p>
    {:else}
        <p>Loading...</p>
    {/if}
{:else}
    <p>
        Compare buying and holding to trading on daily price volatility.
        Backtracker is not meant to predict future performance.
    </p>
{/if}

<style>
    p {
        margin: 1em;
        text-align: center;
        font-size: .8em;
    }
    /* 
        table styles from:
        Simple Responsive Table in CSS
        Matt Smith
        5/26/22
        https://codepen.io/AllThingsSmitty/pen/MyqmdM 
    */
    table {
        border: 1px solid #ccc;
        border-collapse: collapse;
        margin: 0;
        padding: 0;
        width: 100%;
        table-layout: fixed;
    }
    table caption {
        font-size: 1.5em;
        margin: .75em 0 .75em;
        color: rgb(0, 90, 128);
    }
    table tr {
        background-color: #fdfdfd;
        border: 1px solid #ddd;
        padding: .35em;
    }
    table th, table td {
        padding: .625em;
        text-align: center;
    }
    table th {
        font-size: .85em;
        letter-spacing: .1em;
        text-transform: uppercase;
    }
    @media screen and (max-width: 640px) {
        table {
            border: 0;
        }
        table caption {
            font-size: 1.3em;
        }
        table thead {
            border: none;
            clip: rect(0 0 0 0);
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            width: 1px;
        }
        table tr {
            border-bottom: 3px solid #ddd;
            display: block;
            margin-bottom: .625em;
        }
        table td {
            border-bottom: 1px solid #ddd;
            display: block;
            font-size: .8em;
            text-align: right;
        }
        table td::before {
            content: attr(data-label);
            float: left;
            font-weight: bold;
            text-transform: uppercase;
        }
        table td:last-child {
            border-bottom: 0;
        }
    }
</style>