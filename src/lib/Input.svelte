<script>
    import { apiData, dateList, endDate, endPrice, error, metadata, priceList, rateOfReturn, startDate, startPrice, submitted, success, symbol, ticker, timeSeriesDaily, tradeList } from '../stores';
    
    // import API key, assign correctly depending on env
    import { AV_API_KEY } from '$lib/env';
    let avApiKey;
    if (typeof AV_API_KEY === 'string') {
        avApiKey = AV_API_KEY;
    } else {
        avApiKey = process.env.AV_API_KEY;
    }

    //set default percentages for buy/sell thresholds
    let sellThreshold = 1;
    let buyThreshold = -1;

    // calculate dates
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toISOString().split("T")[0];
    let minDate = new Date();
    minDate.setDate(minDate.getDate() - 140);
    minDate = minDate.toISOString().split("T")[0];

    // request data from alpha vantage api
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
        }).catch(e => {
            error.set(e);
            console.log(e);
            return {};
        });
    }

    // set data from request to stores
    function setData(data) {
        apiData.set(data);
        metadata.set(data["Meta Data"]);
        timeSeriesDaily.set(data["Time Series (Daily)"]);
        symbol.set($metadata["2. Symbol"].toUpperCase());
        startPrice.set(Number($timeSeriesDaily[$startDate]["4. close"]));
        endPrice.set(Number($timeSeriesDaily[$endDate]["4. close"]));
    }

    // 
    function calculate() {
        // empty out price and trade lists in case of multiple submissions
        priceList.set([]);
        tradeList.set([]);

        // calculate rate of return based on start and end date closing price
        $rateOfReturn = round(($endPrice-$startPrice)/$startPrice*100, 2);

        // get dates from start+1 to end
        let allDates = Object.keys($timeSeriesDaily);
        $dateList = allDates.slice(allDates.indexOf($endDate), allDates.indexOf($startDate)+1);
        $dateList = $dateList.reverse();

        // get prices for each date in dateList
        for (const date of $dateList) {
            $priceList.push(parseFloat($timeSeriesDaily[date]["4. close"]));
        }

        // set initial price and amount
        let previousClose = $priceList[0];
        let amount = $priceList[0];

        // always invested for the first day at least
        let invested = true;

        // set counter to iterate through dates simultaneously
        let dateCounter = 1;

        // for each price in priceList
        for (const price of $priceList.slice(1)) {
            // create trade object to store details of each trade
            let trade = {};

            // set trade date and increment counter for next round, set closing prices
            trade.date = $dateList[dateCounter];
            dateCounter++;
            trade.previousClose = previousClose;
            trade.todayClose = price;

            // calculate percentage change in closing prices, store rounded version in trade object
            let percentChange = (price-previousClose)/previousClose*100;
            trade.percentChange = round(percentChange, 2);

            // store whether or not amount is currently in or out of the market
            trade.invested = invested;

            // if invested, update amount accordingly
            if (invested) {
                amount = amount * (1+(percentChange/100));
            }

            // log rounded version of amount into trade object, use non rounded for calculation
            trade.amount = round(amount, 2);

            // outcome logic, toggle invested on buys and sells, update trade.outcome
            if (percentChange > sellThreshold) {
                if (invested) {
                    invested = false;
                    trade.outcome = 'SELL';
                } else {
                    trade.outcome = 'HOLD OUT';
                }
            } else if (percentChange < buyThreshold) {
                if (invested) {
                    trade.outcome = 'HOLD IN'
                } else {
                    invested = true;
                    trade.outcome = 'BUY';
                }
            } else {
                if (invested) {
                    trade.outcome = 'HOLD IN'
                } else {
                    trade.outcome = 'HOLD OUT';
                }
            }

            // set previous close to price to use in next iteration
            previousClose = price;

            // push trade object to tradeList when there is a buy or sell, tradeList is displayed to the user
            if (trade.outcome === 'BUY' || trade.outcome === 'SELL') {
                $tradeList.push(trade);
            }
        }
    }

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

    // triggers API call and caculations, submitted controls loading logic
    function handleSubmit() {
        getPrices();
        submitted.set(true);
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <table>
        <thead>
            <tr>
                <th class="labelTd" scope="col"><label for="ticker">Ticker</label></th>
                <th class="labelTd" scope="col"><label for="startDate">Start</label></th>
                <th class="labelTd" scope="col"><label for="endDate">End</label></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td data-label="Ticker"><input type="text" id="ticker" bind:value={$ticker} placeholder="ex: AAPL" required ></td>
                <td data-label="Start"><input type="date" id="startDate" bind:value={$startDate} min={minDate} max={yesterday} required ></td>
                <td data-label="End"><input type="date" id="endDate" bind:value={$endDate} min={$startDate} max={yesterday} required></td>
            </tr>
            <tr>
                <th colspan="2"><label for="buyThreshold">Buy when market is down more than {buyThreshold}%</label></th>
                <td colspan="1"><input type="range" min="-10" max="0" step='.5' id="buyThreshold" bind:value={buyThreshold} required></td>
            </tr>
            <tr>
                <th colspan="2"><label for="sellThreshold">Sell when market is up more than {sellThreshold}%</label></th>
                <td colspan="1"><input type="range" min="0" max="10" step='.5' id="sellThreshold" bind:value={sellThreshold} required></td>
            </tr> 
            <tr id="submitRow">
                <td colspan="3"><button type="submit">SUBMIT</button></td>
            </tr>
        </tbody>
    </table>
</form>

<style>
    button {
        width: 35%;
        height: 3em;
        background-color: rgb(0, 90, 128);
        color: white;
        border: none;
    }
    form {
        margin-bottom: 6vw;
    }

    /* 
        range styles from:
        How to Style Input Type Range in Chrome, Firefox, and IE
        Brenna OBrien
        5/26/22
        https://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html 
    */
    input[type=range]{
        -webkit-appearance: none;
        padding: 0;
        width: 100%;
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
        font-size: .8em;
        letter-spacing: .1em;
        text-transform: uppercase;
    }
    
    @media (max-width: 640px) {
        table {
            border: 0;
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
            display: block;
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