<!-- 
    references:

    https://dev.to/wesleymutwiri/create-beautiful-charts-with-svelte-and-chart-js-512n
    6/6/22
    by: Wesley Mutwiri

    https://www.chartjs.org/docs/latest/samples/animations/progressive-line.html
    6/6/22

    Rounding Decimals in JavaScript
    Jack Moore
    5/26/22
    https://www.jacklmoore.com/notes/rounding-in-javascript/ 
 -->

<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto/auto.js';
    import { dateList, firstChartRender, priceList, portfolio, entry, symbol } from '../stores'

    let comparisonChart;

    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    // push coordinates into two lists
    const buyAndHoldData = [];
    const volData = [];

    for (let i = 0; i < $priceList.length; i++) {
        buyAndHoldData.push({x: i, y: round($priceList[i], 2)});
        if (i === 0) {
            volData.push({x: i, y: round($entry.tradeList[i].previousClose, 2)});
        } else {
            volData.push({x: i, y: $entry.tradeList[i-1].amount});
        } 
    }

    let datasets = [
        {
            label: 'Buy & Hold - '+ $symbol,
            borderColor: 'rgb(252,191,84)',
            backgroundColor: 'white',
            borderWidth: 3,
            radius: 0,
            data: buyAndHoldData,
            borderDash: [5, 5],
        }
    ];
    let entryData;
    for (let i = 0; i < $portfolio.length; i++) {
        entryData = [];
        for (let j = 0; j < $portfolio[i].tradeList.length+1; j++) {
            if (j === 0) {
                entryData.push({x: i, y: round($portfolio[i].tradeList[j].previousClose, 2)});
            } else {
                entryData.push({x: i, y: $portfolio[i].tradeList[j-1].amount});
            } 
        }
        datasets.push(
            {
                label: $portfolio[i].id,
                borderColor: $portfolio[i].color,
                backgroundColor: $portfolio[i].color,
                borderWidth: 3,
                radius: 0,
                data: entryData
            }
        );
    }
    datasets.push(
        {
            label: 'Current',
            borderColor: $entry.color,
            backgroundColor: $entry.color,
            borderWidth: 3,
            radius: 0,
            data: volData
        }
    );

    // create animation for progression
    let totalDuration = 0;
    if ($firstChartRender) {
        totalDuration = 2000;
        firstChartRender.set(false);
    }
    const delayBetweenPoints = totalDuration / buyAndHoldData.length;
    const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
    const animation = {
        x: {
            type: 'number',
            easing: 'linear',
            duration: delayBetweenPoints,
            from: NaN,
            delay(ctx) {
            if (ctx.type !== 'data' || ctx.xStarted) {
                return 0;
            }
            ctx.xStarted = true;
            return ctx.index * delayBetweenPoints;
            }
        },
        y: {
            type: 'number',
            easing: 'linear',
            duration: delayBetweenPoints,
            from: previousY,
            delay(ctx) {
            if (ctx.type !== 'data' || ctx.yStarted) {
                return 0;
            }
            ctx.yStarted = true;
            return ctx.index * delayBetweenPoints;
            }
        }
    };

    const config = {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            animation,
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            interaction: {
            intersect: false
            },
            scales: {
                x: {
                    type: 'category',
                    labels: $dateList
                }
            }
        }
    };
    
    onMount(()=> {
        const ctx = comparisonChart.getContext('2d');
        var myChart = new Chart(ctx, config);
    });
</script>

<div>
    <canvas bind:this={comparisonChart} /> 
</div>

<style>
    div {
        position: relative;
        height: 15em;
    }
</style>

