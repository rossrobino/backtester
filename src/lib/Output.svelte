<script>
    import { submitted, success, symbol, startPrice, endPrice, startDate, endDate, rateOfReturn, tradeList } from '../stores';

    // https://www.jacklmoore.com/notes/rounding-in-javascript/
    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }
</script>



{#if ($submitted)}
    {#if ($success)}
        <table>
            <caption>Strategy Comparison - {$symbol}</caption>
            <thead>
                <tr>
                    <th scope="col">Strategy</th>
                    <th scope="col">{$startDate} Start</th>
                    <th scope="col">{$endDate} End</th>
                    <th scope="col">Return</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td data-label="Strategy">Buy and Hold</td>
                    <td data-label='{$startDate} Start'>{$startPrice}</td>
                    <td data-label='{$endDate} End'>{$endPrice}</td>
                    <td data-label="Buy and hold RoR">{$rateOfReturn}%</td>
                </tr>
                <tr>
                    <td data-label="Strategy">Your Strategy</td>
                    <td data-label='{$startDate} Start'>{$startPrice}</td>
                    <td data-label='{$endDate} End'>{$tradeList[$tradeList.length-1].amount}</td>
                    <td data-label="Buy and hold RoR">{round((($tradeList[$tradeList.length-1].amount)-$startPrice)/$startPrice*100, 2)}%</td>
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
                {#each $tradeList as trade}
                    <tr>
                        <td data-label="Date">{trade.date}</td>
                        <td data-label="Previous Day Close">{trade.previousClose}</td>
                        <td data-label="Close">{trade.todayClose}</td>
                        <td data-label="Change">{trade.percentChange}%</td>
                        <td data-label="Amount">${trade.amount}</td>
                        <td data-label="Action">{trade.outcome}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        Loading...
    {/if}   
{/if}

<style>
    /* table styles from https://codepen.io/AllThingsSmitty/pen/MyqmdM */
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
        margin: .5em 0 .75em;
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