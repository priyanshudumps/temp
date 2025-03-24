import { ICoin, ICoinLinks, ICoinScore, ICoinDexMetrics, ICoinMetrics, ICoinChat } from '../types';

export const COINS: Record<string, ICoin> = {};
export const COIN_LINKS: Record<string, ICoinLinks> = {};
export const COIN_SCORE: Record<string, ICoinScore> = {};
export let COIN_DEX_METRICS: Record<string, ICoinDexMetrics[]> = {};
export const COIN_METRICS: Record<string, ICoinMetrics> = {};
export let COIN_CHATS: Record<string, ICoinChat[]> = {}; 


export const ADDRESSES_WITH_CMC_ID: string[] = [];