import dotenv from 'dotenv';
dotenv.config();

import { Interface, Result } from '@ethersproject/abi';
import { DummyDexHelper } from '../../dex-helper/index';
import { Network, SwapSide } from '../../constants';
import { BI_POWS } from '../../bigint-constants';
import { Fluid } from './fluid';
import {
  checkPoolPrices,
  checkPoolsLiquidity,
  checkConstantPoolPrices,
} from '../../../tests/utils';
import { Tokens } from '../../../tests/constants-e2e';

/*
  README
  ======

  This test script adds tests for Fluid general integration
  with the DEX interface. The test cases below are example tests.
  It is recommended to add tests which cover Fluid specific
  logic.

  You can run this individual test script by running:
  `npx jest src/dex/<dex-name>/<dex-name>-integration.test.ts`

  (This comment should be removed from the final implementation)
*/

const network = Network.MAINNET;
const TokenASymbol = 'TokenASymbol';
const TokenA = Tokens[network][TokenASymbol];

const TokenBSymbol = 'TokenBSymbol';
const TokenB = Tokens[network][TokenBSymbol];

const amounts = [0n, BI_POWS[18], 2000000000000000000n];

const dexHelper = new DummyDexHelper(network);
const dexKey = 'Fluid';

function getReaderCalldata(
  exchangeAddress: string,
  readerIface: Interface,
  amounts: bigint[],
  funcName: string,
  // TODO: Put here additional arguments you need
) {
  return amounts.map(amount => ({
    target: exchangeAddress,
    callData: readerIface.encodeFunctionData(funcName, [
      // TODO: Put here additional arguments to encode them
      amount,
    ]),
  }));
}

function decodeReaderResult(
  results: Result,
  readerIface: Interface,
  funcName: string,
) {
  // TODO: Adapt this function for your needs
  return results.map(result => {
    const parsed = readerIface.decodeFunctionResult(funcName, result);
    return BigInt(parsed[0]._hex);
  });
}

async function checkOnChainPricing(
  fluid: Fluid,
  funcName: string,
  blockNumber: number,
  prices: bigint[],
) {
  const exchangeAddress = ''; // TODO: Put here the real exchange address

  // TODO: Replace dummy interface with the real one
  // Normally you can get it from fluid.Iface or from eventPool.
  // It depends on your implementation
  const readerIface = new Interface('');

  const readerCallData = getReaderCalldata(
    exchangeAddress,
    readerIface,
    amounts.slice(1),
    funcName,
  );
  const readerResult = (
    await dexHelper.multiContract.methods
      .aggregate(readerCallData)
      .call({}, blockNumber)
  ).returnData;
  const expectedPrices = [0n].concat(
    decodeReaderResult(
      readerResult,
      readerIface,
      funcName,
    ),
  );

  expect(prices).toEqual(expectedPrices);
}

describe('Fluid', function () {
  let blockNumber: number;
  let fluid: Fluid;

  beforeAll(async () => {
    blockNumber = await dexHelper.web3Provider.eth.getBlockNumber();

    fluid = new Fluid(network, dexKey, dexHelper);
    await fluid.initializePricing(blockNumber);
  });

  it('getPoolIdentifiers and getPricesVolume SELL', async function () {
    const pools = await fluid.getPoolIdentifiers(
      TokenA,
      TokenB,
      SwapSide.SELL,
      blockNumber,
    );
    console.log(`${TokenASymbol} <> ${TokenBSymbol} Pool Identifiers: `, pools);

    expect(pools.length).toBeGreaterThan(0);

    const poolPrices = await fluid.getPricesVolume(
      TokenA,
      TokenB,
      amounts,
      SwapSide.SELL,
      blockNumber,
      pools,
    );
    console.log(`${TokenASymbol} <> ${TokenBSymbol} Pool Prices: `, poolPrices);

    expect(poolPrices).not.toBeNull();
    if (fluid.hasConstantPriceLargeAmounts) {
      checkConstantPoolPrices(poolPrices!, amounts, dexKey);
    } else {
      checkPoolPrices(poolPrices!, amounts, SwapSide.SELL, dexKey);
    }

    // Check if onchain pricing equals to calculated ones
    await checkOnChainPricing(
      fluid,
      '', // TODO: Put here the functionName to call
      blockNumber,
      poolPrices![0].prices,
    );
  });

  it('getPoolIdentifiers and getPricesVolume BUY', async function () {
    const pools = await fluid.getPoolIdentifiers(
      TokenA,
      TokenB,
      SwapSide.BUY,
      blockNumber,
    );
    console.log(`${TokenASymbol} <> ${TokenBSymbol} Pool Identifiers: `, pools);

    expect(pools.length).toBeGreaterThan(0);

    const poolPrices = await fluid.getPricesVolume(
      TokenA,
      TokenB,
      amounts,
      SwapSide.BUY,
      blockNumber,
      pools,
    );
    console.log(`${TokenASymbol} <> ${TokenBSymbol} Pool Prices: `, poolPrices);

    expect(poolPrices).not.toBeNull();
    if (fluid.hasConstantPriceLargeAmounts) {
      checkConstantPoolPrices(poolPrices!, amounts, dexKey);
    } else {
      checkPoolPrices(poolPrices!, amounts, SwapSide.BUY, dexKey);
    }

    // Check if onchain pricing equals to calculated ones
    await checkOnChainPricing(
      fluid,
      '', // TODO: Put here the functionName to call
      blockNumber,
      poolPrices![0].prices,
    );
  });

  it('getTopPoolsForToken', async function () {
    const poolLiquidity = await fluid.getTopPoolsForToken(
      TokenA.address,
      10,
    );
    console.log(`${TokenASymbol} Top Pools:`, poolLiquidity);

    if (!fluid.hasConstantPriceLargeAmounts) {
      checkPoolsLiquidity(poolLiquidity, TokenA.address, dexKey);
    }
  });
});
