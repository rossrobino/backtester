<!-- 
    references:

    https://dev.to/wesleymutwiri/create-beautiful-charts-with-svelte-and-chart-js-512n
    6/6/22
    by: Wesley Mutwiri

    https://www.chartjs.org/docs/latest/samples/animations/progressive-line.html
    6/6/22
 -->

<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto/auto.js';
    import { dateList, priceList, tradeList } from '../stores'

    let width = window.width;

    let comparisonChart;
    const buyAndHoldData = [];
    const volData = [];
    for (let i = 0; i < $priceList.length; i++) {
        if (i === 0) {
            buyAndHoldData.push({x: i, y: $priceList[i]});
            volData.push({x: i, y: $priceList[i]});
        } else {
            buyAndHoldData.push({x: i, y: $priceList[i]});
            volData.push({x: i, y: $tradeList[i-1].amount});
        } 
    }

    const totalDuration = 2000;
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
            datasets: [
                {
                    label: 'Buy and Hold',
                    borderColor: 'rgb(252,191,84)',
                    backgroundColor: 'white',
                    borderWidth: 4,
                    radius: 1,
                    data: buyAndHoldData,
                    borderDash: [5, 5],
                },
                {
                    label: 'Volatility',
                    borderColor: 'rgb(112,105,253)',
                    backgroundColor: 'rgb(112,105,253)',
                    borderWidth: 4,
                    radius: 1,
                    data: volData,
                }
            ]
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
        if (width < 640) {
            comparisonChart.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
</script>

<svelte:window bind:innerWidth={width} />

<div>
    <canvas bind:this={comparisonChart} /> 
</div>

<style>
    div {
        position: relative;
        height: 15em;
    }
</style>

