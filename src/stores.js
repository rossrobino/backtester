import { writable } from 'svelte/store';

export const apiData = writable({});
export const dateList = writable([]);
export const endDate = writable('');
export const endPrice = writable(0);
export const error = writable('');
export const metadata = writable({});
export const priceList = writable([]);
export const rateOfReturn = writable(0);
export const startDate = writable('');
export const startPrice = writable(0);
export const submitted = writable(false);
export const success = writable(false);
export const symbol = writable('');
export const ticker = writable('');
export const timeSeriesDaily = writable({});
export const tradeList = writable([]);