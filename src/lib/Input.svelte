<script>
    import { ticker, startDate, endDate, startPrice, endPrice, submitted, success, apiData, metadata, symbol } from '../stores';
    
    // import API key, use correct key depending on env
    import { AV_API_KEY } from '$lib/env';
    let avApiKey;
    if (typeof AV_API_KEY === 'string') {
        avApiKey = AV_API_KEY;
    } else {
        avApiKey = process.env.AV_API_KEY;
    }
    
    // calculate yesterday's date
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toISOString().split("T")[0];

    // request data from alpha vantage api, run setData if successful
    async function getPrices() {
        fetch(`https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_DAILY&symbol=${$ticker}&outputsize=compact&datatype=json`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
                'X-RapidAPI-Key': avApiKey
            }
        }).then(response => response.json())
        .then(data => {
            setData(data);
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
        symbol.set(data["Meta Data"]["2. Symbol"]);
        startPrice.set(data["Time Series (Daily)"][$startDate]["4. close"]);
        endPrice.set(data["Time Series (Daily)"][$endDate]["4. close"]);
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
            <td><input type="date" id="startDate" bind:value={$startDate} max={yesterday} required ></td>
        </tr>
        <tr>
            <td><label for="endDate">End Date:</label></td>
            <td><input type="date" id="endDate" bind:value={$endDate} min={$startDate} max={yesterday} required></td>
        </tr>
        <tr>
            <td><button type="submit">Submit</button></td>
        </tr>
    </table>
</form>


