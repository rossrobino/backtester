import { writable } from 'svelte/store';

export const apiData = writable({});
export const colorList = writable([
    'rgb(112,105,253)',
    'rgb(255,33,56)',
    '#aaa'
]);
export const dateList = writable([]);
export const endDate = writable('');
export const endPrice = writable(0);
export const entry = writable({});
export const entryId = writable(1);
export const error = writable('');
export const firstChartRender = writable(true);
export const loading = writable(false);
export const metadata = writable({});
export const priceList = writable([]);
export const rateOfReturn = writable(0);
export const startDate = writable('');
export const startPrice = writable(0);
export const strategy = writable({});
export const portfolio = writable([]);
export const submitted = writable(false);
export const success = writable(false);
export const symbol = writable('');
export const ticker = writable('');
export const timeSeriesDaily = writable({});
export const tradeList = writable([]);
export const volList = writable([]);