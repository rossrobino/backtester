<!-- 
    references:

    https://dev.to/wesleymutwiri/create-beautiful-charts-with-svelte-and-chart-js-512n
    6/6/22
    by: Wesley Mutwiri

    https://www.chartjs.org/docs/latest/charts/bubble.html
    6/22/22

 -->

<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto/auto.js';
    import { returnList } from '../stores';

    let comparisonChart;

    let data = {
        datasets: $returnList
    };

    const config = {
        type: 'bubble',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Return: ' + context.dataset.label + ' (' + context.parsed.x + ',' + context.parsed.y + ')';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: function(value, index, ticks) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Buy'
                    }
                },
                y: {
                    ticks: {
                        callback: function(value, index, ticks) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Sell'
                    }
                }
            }
        }
    };
    
    onMount(()=> {
        const ctx = comparisonChart.getContext('2d');
        let myChart = new Chart(ctx, config);
    });
</script>

<div>
    <canvas bind:this={comparisonChart} > 
</div>

<style>
    div {
        position: relative;
        height: 15em;
    }
</style>