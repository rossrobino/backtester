<script>
    import { apiData, dateList, endDate, endPrice, error, metadata, priceList, rateOfReturn, startDate, startPrice, strategy, submitted, success, symbol, ticker, timeSeriesDaily, tradeList, volList } from '../stores';
    import Switch from '$lib/Switch.svelte';
    import Range from '$lib/Range.svelte';

    // import API key, assign correctly depending on environment
    import { AV_API_KEY } from '$lib/env';
    let avApiKey;
    if (typeof AV_API_KEY === 'string') {
        avApiKey = AV_API_KEY;
    } else {
        avApiKey = process.env.AV_API_KEY;
    }

    const strategies = {
        'types': ['PRICE','VOLUME'],
        'timeFrames': ['DAILY', 'WEEKLY', 'MONTHLY']
    };
    strategy.set({
        'type': 'PRICE',
        'timeFrame': 'DAILY'
    });

    let buyUp = false;
    let tickerInput;

    // set default percentages for buy/sell thresholds
    let sellThreshold;
    let buyThreshold;
    let rangeMin;
    let rangeMax;
    
    function setThresholds() {
        if ($strategy.type === 'VOLUME'){
            rangeMin = -50;
            rangeMax = 50;
        } else {
            rangeMin = -10;
            rangeMax = 10;
        }
        if (buyUp) {
            if ($strategy.type === 'VOLUME'){
                sellThreshold = -5;
                buyThreshold = 5;
            } else {
                sellThreshold = -1;
                buyThreshold = 1;
            } 
        } else {
            if ($strategy.type === 'VOLUME'){
                sellThreshold = 5;
                buyThreshold = -5;
            } else {
                sellThreshold = 1;
                buyThreshold = -1;
            }
        }
    }
    setThresholds();
    


    // set longTerm default timeframe
    let longTerm = false;

    // calculate dates
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toISOString().split("T")[0];
    endDate.set(yesterday);
    let calcStartDate = new Date()
    calcStartDate.setDate(calcStartDate.getDate() - 30);
    calcStartDate = calcStartDate.toISOString().split("T")[0];
    startDate.set(calcStartDate);
    let shortDate = new Date();
    shortDate.setDate(shortDate.getDate() - 140);
    shortDate = shortDate.toISOString().split("T")[0];
    let longDate = "1999-11-01";

    // request data from alpha vantage api
    async function getPrices() {
        // set url based on strategy selected
        let url = `https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_${$strategy.timeFrame}_ADJUSTED&symbol=${$ticker.trim()}${$strategy.timeFrame==='DAILY' ? '&outputsize='+(longTerm ? 'full' : 'compact') : ''}&datatype=json`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
                'X-RapidAPI-Key': avApiKey
            }
        }
        fetch(url, options)
        .then(response => response.json())
        .then(data => {
            try {
                setData(data);
                calculate();
                success.set(true);
            } catch (e) {
                if (data.message) {
                    error.set('Too many requests. Please wait a minute and try again.');
                } else {
                    error.set('Sorry, the ticker you entered is invalid. Please update and try again.');
                }
                console.log(e);
                console.log(data);
            }
        })
        .catch(e => {
            error.set(e);
            console.log(e);
            return {};
        });
    }

    // set data from request to stores
    function setData(data) {
        apiData.set(data);
        metadata.set(data["Meta Data"]);

        // set dataTitle based on strategy
        let dataTitle;
        if ($strategy.timeFrame === 'DAILY') {
            dataTitle = 'Time Series (Daily)';
        } else if ($strategy.timeFrame === 'WEEKLY') {
            dataTitle = 'Weekly Adjusted Time Series';
        } else if ($strategy.timeFrame === 'MONTHLY') {
            dataTitle = 'Monthly Adjusted Time Series';
        }
        
        timeSeriesDaily.set(data[dataTitle]);
        symbol.set($metadata["2. Symbol"].toUpperCase());

        let originalStartDate = $startDate;
        let originalEndDate = $endDate;

        // check start date to see if the market was closed, correct accordingly
        for (let i = 0; i < 35; i++) {
            if ($startDate === $endDate) {
                startDate.set(originalStartDate);
                break;
            }
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
            if (i === 34) {
                error.set('please select a new start date.');
            }
        }

        // check start date to see if the market was closed, correct accordingly
        for (let i = 0; i < 35; i++) {
            if ($startDate === $endDate) {
                endDate.set(originalEndDate);
                break;
            }
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
            if (i === 34) {
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
            if($strategy.type === 'VOLUME') {
                $volList.push(parseFloat($timeSeriesDaily[date]["6. volume"]));
            }
        }

        // set initial price and amount
        let previousClose = $priceList[0];
        let amount = $priceList[0];
        let previousVolume;
        if($strategy.type === 'VOLUME'){
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
            if($strategy.type === 'VOLUME') {
                trade.todayVolume = $volList[counter];
                trade.previousVolume = previousVolume;
            }
            counter++;

            // calculate percentage change in closing prices, store rounded version in trade object
            let percentChangePrice = (price-previousClose)/previousClose*100;
            trade.percentChangePrice = round(percentChangePrice, 2);
            let percentChangeVol;
            if ($strategy.type === 'VOLUME') {
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
            let percentChange = $strategy.type === 'VOLUME' ? percentChangeVol : percentChangePrice;

            // outcome logic, toggle invested on buys and sells, update trade.outcome
            if(!buyUp) {
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
            } else {
                if (percentChange > buyThreshold) {
                    if (!invested) {
                        invested = true;
                        trade.outcome = 'BUY';
                    } else {
                        trade.outcome = 'HOLD IN';
                    }
                } else if (percentChange < sellThreshold) {
                    if (!invested) {
                        trade.outcome = 'HOLD OUT'
                    } else {
                        invested = false;
                        trade.outcome = 'SELL';
                    }
                } else {
                    if (!invested) {
                        trade.outcome = 'HOLD OUT'
                    } else {
                        trade.outcome = 'HOLD IN';
                    }
                }
            }
            
            // set previous close to price to use in next iteration
            previousClose = price;
            if ($strategy.type === 'VOLUME') {
                previousVolume = trade.todayVolume;
            }

            // push trade object to tradeList
            $tradeList.push(trade);
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
        tickerInput.blur();
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
        error.set('');
        getPrices();
        submitted.set(true);
        success.set(false);
    }

    // resets when user changes strategies
    function changeStrategy() {
        submitted.set(false);
        setThresholds();
    }
    function changeBuySell() {
        buyUp = !buyUp;
        let temp = buyThreshold;
        buyThreshold = sellThreshold;
        sellThreshold = temp;
    }
    function changeBuyThreshold() {
        if (!buyUp) {
            if (buyThreshold > sellThreshold){
                sellThreshold = buyThreshold;
            }
        } else {
            if (buyThreshold < sellThreshold){
                sellThreshold = buyThreshold;
            }
        }
    }
    function changeSellThreshold() {
        if (!buyUp) {
            if (sellThreshold < buyThreshold) {
                buyThreshold = sellThreshold;
            }
        } else {
            if (sellThreshold > buyThreshold) {
                buyThreshold = sellThreshold;
            }
        } 
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <table>
        <thead>
            <tr>
                <th class="labelTd" scope="col"><label for="ticker">Ticker</label></th>
                <th class="labelTd" scope="col"><label for="startDate">Start</label></th>
                <th class="labelTd" scope="col"><label for="endDate">End</label></th>
                <th class="labelTd" scope="col"><label for="timeFrame">Time Frame</label></th>
                <th class="labelTd" scope="col"><label for="strategy">Strategy</label></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td data-label="Ticker"><input type="text" id="ticker" bind:value={$ticker} bind:this={tickerInput} placeholder="ex: AAPL" required ></td>
                <td data-label="Start"><input type="date" id="startDate" bind:value={$startDate} min={longDate} max={yesterday} required ></td>
                <td data-label="End"><input type="date" id="endDate" bind:value={$endDate} min={$startDate} max={yesterday} required></td>
                <td data-label="Time Frame">
                    <select id="timeFrame" bind:value={$strategy.timeFrame} required>
                        {#each strategies.timeFrames as opt}
                            <option value={opt}>{opt}</option>
                        {/each}
                </td>
                <td data-label="Strategy">
                    <select id="strategy" bind:value={$strategy.type} on:change={changeStrategy} required>
                        {#each strategies.types as opt}
                            <option value={opt}>{opt}</option>
                        {/each}
                </td>
            </tr>
            <tr>
                <th colspan="2" class='hidden'>{buyUp ? 'Buy Up / Sell Down' : 'Buy Down / Sell Up'}</th>
                <th class='hidden' colspan="1"></th>
                <td data-label={buyUp ? 'Buy Up / Sell Down' : 'Buy Down / Sell Up'} colspan="2">
                    <Switch bind:checked={buyUp} onChange={changeBuySell} />
                </td>
            </tr> 
            <tr>
                <th colspan="2">
                    <label for="buyThreshold">Buy when {$strategy.type} change is {buyUp ? 'greater' : 'less'} than:</label>
                </th>
                <th colspan="1">{buyThreshold}%</th>
                <td colspan="2">
                    <Range 
                        min="{rangeMin}" 
                        max={rangeMax} 
                        id="sellThreshold" 
                        bind:value={buyThreshold} 
                        onChange={changeBuyThreshold} 
                        thumbColor='rgb(255,33,56)' 
                        color1={buyUp ? '#ddd' : 'rgb(112,105,253)'} 
                        color2={buyUp ? '#ddd' : 'rgb(255,33,56)'} 
                        color3={buyUp ? 'rgb(255,33,56)' : '#ddd'} 
                        color4={buyUp ? 'rgb(112,105,253)' : '#ddd'}
                    />
                </td>
            </tr>
            <tr>
                <th colspan="2">
                    <label for="sellThreshold">Sell when {$strategy.type} change is {buyUp ? 'less' : 'greater'} than:</label>
                </th>
                <th colspan="1">{sellThreshold}%</th>
                <td colspan="2">
                    <Range 
                        min="{rangeMin}" 
                        max={rangeMax} 
                        id="sellThreshold" 
                        bind:value={sellThreshold} 
                        onChange={changeSellThreshold} 
                        thumbColor='rgb(255,33,56)' 
                        color1={buyUp ? 'rgb(112,105,253)' : '#ddd'} 
                        color2={buyUp ? 'rgb(255,33,56)' : '#ddd'} 
                        color3={buyUp ? '#ddd' : 'rgb(255,33,56)'} 
                        color4={buyUp ? '#ddd' : 'rgb(112,105,253)'}
                    />
                </td>
            </tr> 
            <tr id="submitRow">
                <td colspan="5"><button type="submit">SUBMIT</button></td>
            </tr>
        </tbody>
    </table>
</form>

<style>
    input, select {
        border: 1px solid #ccc;
        border-radius: 3px;
        width: 8em;
        height: 1.8em;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: black;
        background-color: white;
    }
    input[type='text'] {
        color: black;
    }
    button {
        width: 35%;
        height: 3em;
        background-color: rgb(112,105,253);
        color: white;
        border: none;
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
        font-weight: normal;
    }
    
    @media (max-width: 640px) {
        table {
            border: 0;
        }
        table thead, .hidden {
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
        table th {
            font-size: .62em;
        }
    }
</style>