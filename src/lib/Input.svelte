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
        'type': 'Date',
        'detail': 'Buy and hold'
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
        <tr>
            <td class="labelTd"><label for="detail">Detail</label></td>
            <td>
                {#if strategy.type === 'Date'}
                    <select id="detail" bind:value={strategy.detail} required>
                        {#each strategies.dateDetails as detail}
                            <option value={detail}>{detail}</option>
                        {/each}
                    </select>
                {/if}
            </td>
        </tr>    
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
    tr {
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        height: 5vw;
        background-color: white;
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
            font-size: 5vw;
        }
        table {
            width: 100vw;
        }
        button, tr {
            height: 10vw;
        }
    }

</style>