import { atom } from 'recoil';

export const userState = atom({ key: 'userState', default: null });
export const articlesState = atom({ key: 'articlesState', default: [] });
export const filterState = atom({ key: 'filterState', default: { author: [], type: '', dateRange: null, search: '' }});
export const payoutRateState = atom({ key: 'payoutRateState', default: {} });