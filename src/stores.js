import { writable, derived } from 'svelte/store';

export const ticker = writable('');
export const startDate = writable('');
export const endDate = writable('');
export const submitted = writable(false);
export const success = writable(false);
export const apiData = writable({});
export const metadata = writable({});
export const symbol = writable('');
export const startPrice = writable('');
export const endPrice = writable('');