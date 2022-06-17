<!-- 
        table styles from:
        Simple Responsive Table in CSS
        Matt Smith
        5/26/22
        https://codepen.io/AllThingsSmitty/pen/MyqmdM 
 -->

<script>
    import { apiData, dateList, endDate, endPrice, entry, entryId, error, firstChartRender, loading, metadata, priceList, rateOfReturn, startDate, startPrice, strategy, portfolio, submitted, success, symbol, ticker, timeSeriesDaily, tradeList, volList, colorList } from '../stores';
    import { fade } from 'svelte/transition'
    import Switch from '$lib/Switch.svelte';
    import Range from '$lib/Range.svelte';
    import Fa from 'svelte-fa/src/fa.svelte';
    import { faPercent, faSpinner, faChartLine } from '@fortawesome/free-solid-svg-icons/index.es';

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

    let startInvested = false;
    let buyUp = false;
    let more = false;
    let tickerInput;
    let buyThresholdInput;
    let sellThresholdInput;

    // set default percentages for buy/sell thresholds
    let sellThreshold = 1;
    let buyThreshold = -1;
    let rangeMin = -10;
    let rangeMax = 10;
    
    function setThresholds() {
        if ($strategy.type === 'VOLUME'){
            rangeMin = -50;
            rangeMax = 50;
        } else {
            rangeMin = -10;
            rangeMax = 10;
        }
    }
    
    // set longTerm default timeframe
    let longTerm = false;

    // calculate dates
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toISOString().split("T")[0];

    endDate.set(yesterday);

    let calcStartDate = new Date()
    calcStartDate.setDate(calcStartDate.getDate() - 90);
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
                loading.set(false);
            } catch (e) {
                if (data.message) {
                    error.set('Too many requests. Please wait a minute and try again.');
                } else {
                    error.set('Sorry, the ticker you entered is invalid. Please update and try again.');
                }
                console.log(e);
                console.log(data);
                loading.set(false);
            }
        })
        .catch(e => {
            error.set(e);
            console.log(e);
            loading.set(false);
            return {};
        });
    }

    // set data from request to stores
    function setData(data) {
        apiData.set(data);
        metadata.set(data[Object.keys(data)[0]]);
        
        timeSeriesDaily.set(data[Object.keys(data)[1]]);
        symbol.set($metadata[Object.keys($metadata)[1]].toUpperCase());

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

        // check end date to see if the market was closed, correct accordingly
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
        }
        

        // always invested for the first day at least
        let invested = startInvested;

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
        entry.set({
            "id": $entryId,
            "ticker": $symbol,
            "timeFrame": $strategy.timeFrame,
            "strategyType": $strategy.type,
            "buy": (buyUp ? '> ' + buyThreshold : '< ' + buyThreshold),
            "sell": (buyUp ? '< ' + sellThreshold : '> ' + sellThreshold),
            "startInvested": (startInvested ? 'YES' : 'NO'),
            "tradeList": $tradeList, 
            "return": round((($tradeList[$tradeList.length-1].amount)-$startPrice)/$startPrice*100, 2),
            "startPrice": round($startPrice,2),
            "endPrice": $tradeList[$tradeList.length-1].amount
        });
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

    // check if compact or full request should be made, set longTerm accordingly
    function checkLongTerm() {
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
        return longTerm;
    }

    // triggers API call and caculations, submitted controls loading logic, reset error store
    function handleSubmit() {
        loading.set(true);
        tickerInput.blur();
        buyThresholdInput.blur();
        sellThresholdInput.blur();
        checkLongTerm();
        firstChartRender.set(true); // controls chart progress animation
        error.set('');
        getPrices();
        submitted.set(true);
        success.set(false);
    }

    // input changes    
    let trimmedUpperTicker;
    $: trimmedUpperTicker = $ticker.toUpperCase().trim();

    function changeDate() {
        if ($success && trimmedUpperTicker === $symbol) {
            portfolio.set([]);
            entryId.set(1);
            colorList.set($colorList.slice(0,3));
            let originalLongTerm = longTerm;
            let newLongTerm = checkLongTerm();
            if (originalLongTerm || (!originalLongTerm && !newLongTerm)) {
                setData($apiData);
                recalculate();
            } else {
                handleSubmit();
            }
        }
    }
    function changeTimeFrame() {
        if ($success && trimmedUpperTicker === $symbol) {
            handleSubmit();
        }
    }
    function changeStrategy() {
        setThresholds();
        if ($success && trimmedUpperTicker === $symbol) {
            recalculate();
        }
    }
    function changeBuySell() {
        buyUp = !buyUp;
        let temp = buyThreshold;
        buyThreshold = sellThreshold;
        sellThreshold = temp;
        recalculate();
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
        recalculate();
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
        recalculate();
    }
    function toggleMore() {
        more = !more;
    }
    function toggleInvested() {
        startInvested = !startInvested;
        recalculate();
    }
    function recalculate() {
        if ($success && trimmedUpperTicker === $symbol) {
            calculate();
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <table>
        <thead>
            <tr>
                <th scope="col"><label for="ticker">Ticker</label></th>
                <th scope="col"><label for="startDate">Start</label></th>
                <th scope="col"><label for="endDate">End</label></th>
                <th scope="col"><label for="timeFrame">Time Frame</label></th>
                <th scope="col"><label for="strategy">Strategy</label></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class='inputTd' data-label="Ticker">
                    <input 
                        type="text" 
                        id="ticker" 
                        bind:value={$ticker} 
                        bind:this={tickerInput} 
                        placeholder="ex: AAPL" 
                        required 
                    >
                </td>
                <td class='inputTd' data-label="Start">
                    <input 
                        type="date" 
                        id="startDate" 
                        bind:value={$startDate} 
                        on:change={changeDate}
                        min={longDate} 
                        max={yesterday} 
                        required 
                    >
                </td>
                <td class='inputTd' data-label="End">
                    <input 
                        type="date" 
                        id="endDate" 
                        bind:value={$endDate}
                        on:change={changeDate} 
                        min={$startDate} 
                        max={yesterday} 
                        required
                    >
                </td>
                <td class='inputTd' data-label="Time Frame">
                    <select id="timeFrame" bind:value={$strategy.timeFrame} on:change={changeTimeFrame} required>
                        {#each strategies.timeFrames as opt}
                            <option value={opt}>{opt}</option>
                        {/each}
                </td>
                <td class='inputTd' data-label="Strategy">
                    <select id="strategy" bind:value={$strategy.type} on:change={changeStrategy} required>
                        {#each strategies.types as opt}
                            <option value={opt}>{opt}</option>
                        {/each}
                </td>
            </tr>
            <tr>
                <th colspan="2" class='hidden'>{buyUp ? 'Buy High / Sell Low' : 'Buy Low / Sell High'}</th>
                <th class='hidden' colspan="1"></th>
                <td data-label={buyUp ? 'Buy High / Sell Low' : 'Buy Low / Sell High'} colspan="2">
                    <Switch bind:checked={buyUp} on:change={changeBuySell} />
                </td>
            </tr>  
            <tr>
                <th colspan="2" class='buySellLabelTh'>
                    <label for="buyThreshold">Buy when {$strategy.type.toLowerCase()} change is {buyUp ? 'greater' : 'less'} than:</label>
                </th>
                <th colspan="1" class='buySellInputTh'>
                    <div class='noWrap'>
                        <input 
                            id='buySellInput' 
                            type='number' 
                            bind:value={buyThreshold} 
                            on:change={changeBuyThreshold} 
                            bind:this={buyThresholdInput} 
                        /> <Fa icon={faPercent} />
                    </div>
                </th>
                <td class='rangeTd' colspan="2">
                    <Range 
                        min="{rangeMin}" 
                        max={rangeMax} 
                        id="sellThreshold" 
                        bind:value={buyThreshold} 
                        on:change={changeBuyThreshold}
                        thumbColor='rgb(255,33,56)' 
                        color1={buyUp ? '#ddd' : 'rgb(112,105,253)'} 
                        color2={buyUp ? '#ccc' : 'rgb(255,33,56)'} 
                        color3={buyUp ? 'rgb(255,33,56)' : '#ccc'} 
                        color4={buyUp ? 'rgb(112,105,253)' : '#ddd'}
                    />
                </td>
            </tr>
            <tr>
                <th colspan="2" class='buySellLabelTh'>
                    <label for="sellThreshold">Sell when {$strategy.type.toLowerCase()} change is {buyUp ? 'less' : 'greater'} than:</label>
                </th>
                <th colspan="1" class='buySellInputTh'>
                    <div class='noWrap'>
                        <input 
                            id='buySellInput' 
                            type='number' 
                            bind:value={sellThreshold} 
                            on:change={changeSellThreshold} 
                            bind:this={sellThresholdInput} 
                        /> <Fa icon={faPercent} />
                    </div>
                </th>
                <td class='rangeTd' colspan="2">
                    <Range 
                        min="{rangeMin}" 
                        max={rangeMax} 
                        id="sellThreshold" 
                        bind:value={sellThreshold} 
                        on:change={changeSellThreshold}
                        thumbColor='rgb(255,33,56)' 
                        color1={buyUp ? 'rgb(112,105,253)' : '#ddd'} 
                        color2={buyUp ? 'rgb(255,33,56)' : '#ccc'} 
                        color3={buyUp ? '#ccc' : 'rgb(255,33,56)'} 
                        color4={buyUp ? '#ddd' : 'rgb(112,105,253)'}
                    />
                </td>
            </tr> 
            <tr id='more' on:click={toggleMore}>
                <th colspan="2" class='hidden'>More Options</th>
                <th class='hidden' colspan="1"></th>
                <td data-label='More Options' colspan="2" >
                    <span class='plusMinus'>
                        {#if (more)}
                            &minus;
                        {:else}
                            &plus;
                        {/if}
                    </span>
                </td>
            </tr>
            {#if (more)}
                <tr transition:fade="{{ duration: 80 }}">
                    <th colspan="2" class='hidden'>Start Invested</th>
                    <th class='hidden' colspan="1"></th>
                    <td data-label='Start Invested' colspan="2">
                        <Switch bind:checked={startInvested} on:change={toggleInvested} />
                    </td>
                </tr>   
            {/if}
            <tr id="submitRow">
                <td colspan="5">
                    <button type="submit">
                        {#if ($loading)}
                            <Fa icon={faSpinner} spin/>&nbsp LOADING
                        {:else}
                            <Fa icon={faChartLine} />&nbsp; SUBMIT 
                        {/if}
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</form>

<style>
    form {
        padding: 0.6rem 1rem;
    }
    input, select {
        border: 1px solid #ccc;
        border-radius: 3px;
        width: 7.1rem;
        height: 1.7rem;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #555;
        background-color: white;
        font-size: .8rem;
    }
    select {
        cursor: pointer;
    }
    button {
        width: 35%;
        height: 2.6rem;
        background-color: rgb(112,105,253);
        border-radius: 3px;
        color: white;
        border: none;
    }
    button:hover {
        cursor: pointer;
    }
    table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
        font-size: .8rem;
        letter-spacing: .09rem;
    }
    table tr {
        border-bottom: 1px solid #ddd;
    }
    table th, table td {
        padding: .5rem;
        text-align: center;
    }
    table th {
        font-weight: normal;
    }
    table thead tr {
        border-bottom: none;
    }
    .inputTd {
        padding-top: 0;
    }
    #buySellInput {
        width: 3rem;
        text-align: center;
    }
    .noWrap {
        white-space: nowrap;
    }
    #more {
        border-top: 1px solid #ddd;
    }
    #more:hover {
        cursor: pointer;
    }
    .plusMinus {
        font-size: 1.2rem;
        height: 1.7rem;
        display: block;
    }
    
    @media (max-width: 640px) {
        input, select {
            width: 7.5rem;
        }
        table thead, .hidden {
            height: 1px;
            overflow: hidden;
            position: absolute;
        }
        table tr {
            display: block;
        }
        table td {
            border-bottom: 1px solid #ddd;
            display: block;     
            text-align: right;
        }
        table td::before {
            content: attr(data-label);
            float: left;
        }
        table td:last-child {
            border-bottom: 0;
        }
        table th {
            padding-bottom: 0;
        }
        .inputTd {
            padding:  .5rem;
        }
        .rangeTd {
            padding-bottom: .7rem;
        }
        /* .buySellInputTh {
            display: block;
            text-align: right;
        } */
        .buySellLabelTh {
            text-align: left;
        }
    }
</style>