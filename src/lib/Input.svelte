<script>
    import { ticker, startDate, endDate, startPrice, endPrice, priceList, submitted, timeSeriesDaily, success, apiData, metadata, symbol, rateOfReturn, dateList, tradeList } from '../stores';
    
    // import API key, assign correctly depending on env
    import { AV_API_KEY } from '$lib/env';
    let avApiKey;
    if (typeof AV_API_KEY === 'string') {
        avApiKey = AV_API_KEY;
    } else {
        avApiKey = process.env.AV_API_KEY;
    }

    const strategies = {
        'types': ['Price','Date','Volume'],
        'dateDetails': ['Buy and hold']
    }
    let strategy = {
        'type': 'Price',
        'dateDetail': 'Buy and hold'
    }

    let sellThreshold = 1;
    let buyThreshold = -1;

    // calculate dates
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toISOString().split("T")[0];
    let minDate = new Date();
    minDate.setDate(minDate.getDate() - 140);
    minDate = minDate.toISOString().split("T")[0];

    // request data from alpha vantage api, run setData if successful
    async function getPrices() {
        success.set(false);
        fetch(`https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_DAILY&symbol=${$ticker.trim()}&outputsize=compact&datatype=json`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
                'X-RapidAPI-Key': avApiKey
            }
        }).then(response => response.json())
        .then(data => {
            setData(data);
            calculate();
            success.set(true);
        }).catch(error => {
            console.log(error);
            return {};
        });
    }

    // sets data from request to stores
    function setData(data) {
        console.log(data);
        apiData.set(data);
        metadata.set(data["Meta Data"]);
        timeSeriesDaily.set(data["Time Series (Daily)"]);
        symbol.set($metadata["2. Symbol"].toUpperCase());
        startPrice.set(Number($timeSeriesDaily[$startDate]["4. close"]));
        endPrice.set(Number($timeSeriesDaily[$endDate]["4. close"]));
    }

    function calculate() {
        priceList.set([]);
        tradeList.set([]);
        
        //calculate rate of return based on start and end dates' closing prices
        $rateOfReturn = round(($endPrice-$startPrice)/$startPrice*100, 2);

        //get list of dates between start and end
        let allDates = Object.keys($timeSeriesDaily);
        $dateList = allDates.slice(allDates.indexOf($endDate), allDates.indexOf($startDate)+1);
        $dateList = $dateList.reverse();
        console.log($dateList);

        //get prices for each date
        for (const date of $dateList) {
            $priceList.push(parseFloat($timeSeriesDaily[date]["4. close"]));
        }
        console.log($priceList);

        //when price increases by one percent, sell, print ending amount
        let previousClose = $priceList[0];
        let amount = $priceList[0];
        let invested = true;
        let dateCounter = 1;
        for (const price of $priceList.slice(1)) {
            let trade = {};
            trade.date = $dateList[dateCounter];
            dateCounter++;
            trade.previousClose = previousClose;
            trade.todayClose = price;
            let percentChange = (price-previousClose)/previousClose*100;
            trade.percentChange = round(percentChange, 2);
            trade.invested = invested;
            if (invested) {
                amount = amount * (1+(percentChange/100));
            }
            trade.amount = round(amount, 2);
            if (percentChange > sellThreshold) {
                if (invested) {
                    invested = false;
                    trade.outcome = 'SELL';
                } else {
                    trade.outcome = 'HOLD OUT';
                }
            } else if (percentChange < buyThreshold) {
                if (!invested) {
                    invested = true;
                    console.log("Percent change is less than " + buyThreshold + "--buy");
                    trade.outcome = 'BUY';
                } else {
                    trade.outcome = 'HOLD IN'
                }
            } else {
                if (invested) {
                    trade.outcome = 'HOLD IN'
                } else {
                    trade.outcome = 'HOLD OUT';
                }
            }
            previousClose = price;
            $tradeList.push(trade);
        }
        console.log($tradeList);
    }

    // https://www.jacklmoore.com/notes/rounding-in-javascript/
    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    function handleSubmit() {
        getPrices();
        submitted.set(true);
    }

</script>

<form on:submit|preventDefault={handleSubmit}>
    <table>
        <tr>
            <td class="labelTd"><label for="ticker">Ticker</label></td>
            <td><input type="text" id="ticker" bind:value={$ticker} placeholder="ex: AAPL" required ></td>
        </tr>
        <tr>
            <td class="labelTd"><label for="startDate">Start</label></td>
            <td><input type="date" id="startDate" bind:value={$startDate} min={minDate} max={yesterday} required ></td>
        </tr>
        <tr>
            <td class="labelTd"><label for="endDate">End</label></td>
            <td><input type="date" id="endDate" bind:value={$endDate} min={$startDate} max={yesterday} required></td>
        </tr>
        <tr>
            <td class="labelTd"><label for="strategy">Strategy</label></td>
            <td>
                <select id="strategy" bind:value={strategy.type} required>
                    {#each strategies.types as opt}
                        <option value={opt}>{opt}</option>
                    {/each}
                </select>
            </td>
        </tr>
        {#if strategy.type === 'Price'}
            <tr>
                <td colspan="2"><label for="buyThreshold">Buy when market is down more than {buyThreshold}%</label></td>
            </tr>
            <tr>
                
                <td colspan="2"><input type="range" min="-10" max="0" step='.25' id="buyThreshold" bind:value={buyThreshold} required></td>
            </tr>
            <tr>
                <td colspan="2"><label for="sellThreshold">Sell when market is up more than {sellThreshold}%</label></td>
            </tr>
            <tr>
                
                <td colspan="2"><input type="range" min="0" max="10" step='.25' id="sellThreshold" bind:value={sellThreshold} required></td>
            </tr>
        {/if}
        {#if strategy.type === 'Date'}
            <tr>
                <td class="labelTd"><label for="detail">Detail</label></td>
                <td>
                    <select id="detail" bind:value={strategy.dateDetail} required>
                        {#each strategies.dateDetails as detail}
                            <option value={detail}>{detail}</option>
                        {/each}
                    </select>
                </td>
            </tr>
        {/if}    
        <tr id="submitRow">
            <td colspan="2"><button type="submit">Submit</button></td>
        </tr>
    </table>
</form>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-size: 2vw;
        border: none;
    }
    input, select {
        width: 100%;
    }
    button {
        width: 100%;
        height: 5vw;
        background-color: rgb(0, 90, 128);
        color: white;
    }
    /* range styling from https://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html */
    input[type=range]{
        -webkit-appearance: none;
        padding: 0;
    }
    input[type=range]::-webkit-slider-runnable-track {
        height: 5px;
        background: #ddd;
        border: none;
        border-radius: 3px;
    }
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        border: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: goldenrod;
        margin-top: -6px;
    }
    input[type=range]:focus::-webkit-slider-runnable-track {
        background: #ccc;
    }
    tr {
        height: 5vw;
        box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    }
    label {
        padding: 0 1em;
    }
    table {
        width: 55vw;
        background-color: white;
    }
    @media (max-width: 1007px) {
        * {
            font-size: 3vw;
        }
        table {
            width: 70vw;
        }
        button, tr {
            height: 7vw;
        }
    }
    @media (max-width: 640px) {
        * {
            font-size: 4vw;
        }
        table {
            width: 100vw;
        }
        button, tr {
            height: 10vw;
        }
    }
</style>