import { Address } from './types';
export { SwapSide, ContractMethod } from 'paraswap-core';

export const ETHER_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const MAX_UINT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const MAX_INT =
  '57896044618658097711785492504343953926634992332820282019728792003956564819967';
export const MIN_INT =
  '-57896044618658097711785492504343953926634992332820282019728792003956564819967';

export const MAX_BLOCKS_HISTORY = 7;

export const SETUP_RETRY_TIMEOUT = 20 * 1000; // 20s

export const FETCH_POOL_IDENTIFIER_TIMEOUT = 1 * 1000; // 1s
export const FETCH_POOL_PRICES_TIMEOUT = 3 * 1000; // 3s

export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  BSC = 56,
  POLYGON = 137,
  AVALANCHE = 43114,
  FANTOM = 250,
  ARBITRUM = 42161,
  ZK_SYNC_MAINNET = 271,
  ZK_SYNC_ROPSTEN = 273,
}

export const SUBGRAPH_TIMEOUT = 20 * 1000;

export enum LIMIT_ORDER_PROVIDERS {
  PARASWAP = 'ParaSwapLimitOrderProvider',
}