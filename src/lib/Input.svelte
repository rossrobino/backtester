<script>
    import { ticker, startDate, endDate, startPrice, endPrice, submitted, success, apiData, metadata, symbol, rateOfReturn } from '../stores';
    
    // import API key, assign correctly depending on env
    import { AV_API_KEY } from '$lib/env';
    let avApiKey;
    if (typeof AV_API_KEY === 'string') {
        avApiKey = AV_API_KEY;
    } else {
        avApiKey = process.env.AV_API_KEY;
    }

    const strategies = {
        'types': ['Date','Price','Volume'],
        'dateDetails': ['Buy and hold', 'Custom']
    }
    let strategy = {
        'type': '',
        'detail': ''
    }
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
        symbol.set(data["Meta Data"]["2. Symbol"].toUpperCase());
        startPrice.set(Number(data["Time Series (Daily)"][$startDate]["4. close"]));
        endPrice.set(Number(data["Time Series (Daily)"][$endDate]["4. close"]));
    }

    function calculate() {
        $rateOfReturn = round(($endPrice-$startPrice)/$startPrice*100, 2);

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
            <td><label for="ticker">Ticker:</label></td>
            <td><input type="text" id="ticker" bind:value={$ticker} placeholder="ex: AAPL" required ></td>
        </tr>
        <tr>
            <td><label for="startDate">Start Date:</label></td>
            <td><input type="date" id="startDate" bind:value={$startDate} min={minDate} max={yesterday} required ></td>
        </tr>
        <tr>
            <td><label for="endDate">End Date:</label></td>
            <td><input type="date" id="endDate" bind:value={$endDate} min={$startDate} max={yesterday} required></td>
        </tr>
        <tr>
            <td><label for="strategy">Trade On:</label></td>
            <td>
                <select id="strategy" bind:value={strategy.type} required>
                    <option selected disabled hidden></option>
                    {#each strategies.types as opt}
                        <option value={opt}>{opt}</option>
                    {/each}
                </select>
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
                {#if strategy.type === 'Date'}
                    <select id="detail" bind:value={strategy.detail} required>
                        <option selected disabled hidden></option>
                        {#each strategies.dateDetails as detail}
                            <option value={detail}>{detail}</option>
                        {/each}
                    </select>
                {/if}
            </td>
            
        </tr>    
        <tr id="submitRow">
            <td></td>
            <td><button type="submit">Submit</button></td>
        </tr>
    </table>
</form>

<style>
    input {
        width: 100%;
    }
    select {
        width: 100%;
    }
</style>