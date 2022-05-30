<script>
    import { apiData, dateList, endDate, endPrice, error, metadata, priceList, rateOfReturn, startDate, startPrice, strategy, submitted, success, symbol, ticker, timeSeriesDaily, tradeList, volList } from '../stores';

    // import API key, assign correctly depending on environment
    import { AV_API_KEY } from '$lib/env';
    let avApiKey;
    if (typeof AV_API_KEY === 'string') {
        avApiKey = AV_API_KEY;
    } else {
        avApiKey = process.env.AV_API_KEY;
    }

    const strategies = {
        'types': ['Price','Volume'],
    }
    strategy.set({
        'type': 'Price'
    });

    // set default percentages for buy/sell thresholds
    let sellThreshold = 1;
    let buyThreshold = -1;

    // set longTerm default timeframe
    let longTerm = false;

    // calculate dates
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toISOString().split("T")[0];
    endDate.set(yesterday);
    let calcStartDate = new Date()
    calcStartDate.setDate(calcStartDate.getDate() -30);
    calcStartDate = calcStartDate.toISOString().split("T")[0];
    startDate.set(calcStartDate);
    let shortDate = new Date();
    shortDate.setDate(shortDate.getDate() - 140);
    shortDate = shortDate.toISOString().split("T")[0];
    let longDate = "1999-11-01";

    // request data from alpha vantage api
    async function getPrices() {
        fetch(`https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${$ticker.trim()}&outputsize=${longTerm ? 'full' : 'compact'}&datatype=json`, {
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

        // check start date to see if the market was closed, correct accordingly
        for (let i = 0; i < 6; i++) {
            try {
                startPrice.set(Number($timeSeriesDaily[$startDate]["5. adjusted close"]));
                break;
            } catch {
                let newDate = $startDate.split('-');

                // if it's the last day of the month, reset day and increment month
                if ((newDate[2] === '31') || 
                    ((newDate[1] === '04' || newDate[1] === '06' || newDate[1] === '09' || newDate[1] === '11') && newDate[2] === '30') ||
                    ((newDate[1] === '02' && newDate[2] === '28') && !leapYear(parseInt(newDate[0]))) ||
                    ((newDate[1] === '02' && newDate[2] === '29')) 
                    ) {
                    newDate[2] = '0';
                    if (newDate[1] === '12') {
                        newDate[1] = '01';
                    } else {
                        newDate[1] = (parseInt(newDate[1])+1).toString();
                        if (newDate[1].length < 2) {
                            newDate[1] = "0" + newDate[1];
                        }
                    }
                }

                // increment day, set back to string, update start date
                newDate[2] = (parseInt(newDate[2])+1).toString();
                if (newDate[2].length < 2) {
                    newDate[2] = "0" + newDate[2];
                }
                newDate = newDate.join('-');
                startDate.set(newDate);
            }

            // if error is still not correct after the fifth iteration, display message
            if (i === 5) {
                error.set('please select a new start date.');
            }
        }

        // check start date to see if the market was closed, correct accordingly
        for (let i = 0; i < 6; i++) {
            try {
                endPrice.set(Number($timeSeriesDaily[$endDate]["5. adjusted close"]));
                break;
            } catch {
                let newDate = $endDate.split('-');

                // if it's the first day of the month, reset day to and decrement month
                if ( newDate[2] === '01' ) {
                    newDate[2] = '32';
                    if (newDate[1] === '01') {
                        newDate[1] = '12';
                    } else {
                        newDate[1] = (parseInt(newDate[1])-1).toString();
                        if (newDate[1].length < 2) {
                            newDate[1] = "0" + newDate[1];
                        }
                    }
                }

                // decrement day, set back to string, update start date
                newDate[2] = (parseInt(newDate[2])-1).toString();
                if (newDate[2].length < 2) {
                    newDate[2] = "0" + newDate[2];
                }
                newDate = newDate.join('-');
                endDate.set(newDate);
            }

            // if error is still not correct after the last iteration, display message
            if (i === 5) {
                error.set('please select a new end date.');
            }
        }
    }

    // determine results and set values into stores.js
    function calculate() {
        // empty out price and trade lists in case of multiple submissions
        priceList.set([]);
        tradeList.set([]);
        volList.set([]);

        // calculate buy and hold rate of return based on start and end date closing price
        $rateOfReturn = round(($endPrice-$startPrice)/$startPrice*100, 2);

        // get dates from start+1 to end
        let allDates = Object.keys($timeSeriesDaily);
        $dateList = allDates.slice(allDates.indexOf($endDate), allDates.indexOf($startDate)+1);
        $dateList = $dateList.reverse();

        // get prices for each date in dateList
        for (const date of $dateList) {
            $priceList.push(parseFloat($timeSeriesDaily[date]["5. adjusted close"]));
            // if volume strategy is selected
            if($strategy.type === 'Volume') {
                $volList.push(parseFloat($timeSeriesDaily[date]["6. volume"]));
            }
        }

        // set initial price and amount
        let previousClose = $priceList[0];
        let amount = $priceList[0];
        let previousVolume;
        if($strategy.type === 'Volume'){
            previousVolume = $volList[0];
            console.log(previousVolume)
        }
        

        // always invested for the first day at least
        let invested = true;

        // set counter
        let counter = 1;

        // for each price in priceList
        for (const price of $priceList.slice(1)) {
            // create trade object to store details of each trade
            let trade = {};

            // set trade date and increment counter for next round, set closing prices
            trade.date = $dateList[counter];
            trade.previousClose = previousClose;
            trade.todayClose = price;
            if($strategy.type === 'Volume') {
                trade.todayVolume = $volList[counter];
                trade.previousVolume = previousVolume;
            }
            counter++;

            // calculate percentage change in closing prices, store rounded version in trade object
            let percentChangePrice = (price-previousClose)/previousClose*100;
            trade.percentChangePrice = round(percentChangePrice, 2);
            let percentChangeVol;
            if ($strategy.type === 'Volume') {
                percentChangeVol = (trade.todayVolume-previousVolume)/previousVolume*100;
                trade.percentChangeVol = round(percentChangeVol, 2);
            }
            
            // store whether or not amount is currently in or out of the market
            trade.invested = invested;

            // if invested, update amount accordingly
            if (invested) {
                amount = amount * (1+(percentChangePrice/100));
            }

            // log rounded version of amount into trade object, use non rounded for calculation
            trade.amount = round(amount, 2);

            // trade based on the strategy selected
            let percentChange = $strategy.type === 'Volume' ? percentChangeVol : percentChangePrice;

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
            if ($strategy.type === 'Volume') {
                previousVolume = trade.todayVolume;
            }

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

    /*
        leap year function from:
        JavaScript: Check whether a given year is a leap year in the Gregorian calendar
        5/27/22
        https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-6.php
    */
    function leapYear(year) {
        return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
    }

    // triggers API call and caculations, submitted controls loading logic, reset error store
    function handleSubmit() {
        // check if compact or full request should be made, set longTerm accordingly
        let checkStartDate = $startDate.split('-');
        let checkShortDate = shortDate.split('-');
        if (
            (checkStartDate[0] < checkShortDate[0]) ||
            ((checkStartDate[0] === checkShortDate[0]) && (checkStartDate[1] < checkShortDate[1])) ||
            ((checkStartDate[0] === checkShortDate[0]) && (checkStartDate[1] === checkShortDate[1]) && (checkStartDate[2] < checkShortDate[2]))
            ) {
                longTerm = true;
        } else {
            longTerm = false;
        }
        getPrices();
        submitted.set(true);
        success.set(false);
        error.set('');
    }

    // resets when user changes strategies
    function changeStrategy() {
        submitted.set(false);
        buyThreshold = -1;
        sellThreshold = 1;
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <table>
        <thead>
            <tr>
                <th class="labelTd" scope="col"><label for="ticker">Ticker</label></th>
                <th class="labelTd" scope="col"><label for="startDate">Start</label></th>
                <th class="labelTd" scope="col"><label for="endDate">End</label></th>
                <th class="labelTd" scope="col"><label for="endDate">Strategy</label></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td data-label="Ticker"><input type="text" id="ticker" bind:value={$ticker} placeholder="ex: AAPL" required ></td>
                <td data-label="Start"><input type="date" id="startDate" bind:value={$startDate} min={longDate} max={yesterday} required ></td>
                <td data-label="End"><input type="date" id="endDate" bind:value={$endDate} min={$startDate} max={yesterday} required></td>
                <td data-label="Strategy">
                    <select id="strategy" bind:value={$strategy.type} on:change={changeStrategy} required>
                        {#each strategies.types as opt}
                            <option value={opt}>{opt}</option>
                        {/each}
                </td>
            </tr>
            <tr>
                <th colspan="2"><label for="buyThreshold">Buy when {$strategy.type} is down more than {buyThreshold}%</label></th>
                <td colspan="2"><input type="range" min={$strategy.type === 'Volume' ? "-50" : "-10"} max="0" step='.5' id="buyThreshold" bind:value={buyThreshold} required></td>
            </tr>
            <tr>
                <th colspan="2"><label for="sellThreshold">Sell when {$strategy.type} is up more than {sellThreshold}%</label></th>
                <td colspan="2"><input type="range" min="0" max={$strategy.type === 'Volume' ? "50" : "10"} step='.5' id="sellThreshold" bind:value={sellThreshold} required></td>
            </tr> 
            <tr id="submitRow">
                <td colspan="4"><button type="submit">SUBMIT</button></td>
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
        font-size: .7em;
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