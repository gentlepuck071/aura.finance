// noinspection GraphQLUnresolvedReference

import { BigNumber, BigNumberish } from 'ethers'
import { parseUnits } from 'ethers/lib/utils.js'
import { Pipeline, Claims } from '../types.js'

export async function getClaims(pipeline: Pipeline) {
  const {
    logger,
    globalData: {
      auraTotalCliffs,
      auraTotalSupply,
      auraReductionPerCliff,
      auraMaxSupply,
    },
    rewardsPaid,
  } = pipeline

  logger(`Processing ${Object.keys(rewardsPaid).length} claims...`)

  const claims: Claims = Object.fromEntries(
    Object.entries(rewardsPaid).map(([account, { totalAmount }]) => [
      account,
      getAuraMintAmount(
        totalAmount,
        auraReductionPerCliff,
        auraMaxSupply,
        auraTotalSupply,
        auraTotalCliffs,
      ),
    ]),
  )

  // TODO IMPORTANT: remove after Epoch 2
  const OLD_POOLS_CLAIM_USER = '0xAE0BAF66E8f5Bb87A6fd54066e469cDfE93212Ec'
  const OLD_POOLS_CLAIM_AMOUNT = '16025.803419402348646235'
  logger(
    `Adding user's missing claims from epoch 1: ${OLD_POOLS_CLAIM_USER} (amount: ${OLD_POOLS_CLAIM_AMOUNT})`,
  )
  claims[OLD_POOLS_CLAIM_USER] = (
    claims[OLD_POOLS_CLAIM_USER] ?? BigNumber.from(0)
  ).add(parseUnits(OLD_POOLS_CLAIM_AMOUNT))

  logger()

  return { ...pipeline, claims }
}

function getAuraMintAmount(
  balEarned: BigNumber,
  auraReductionPerCliff: BigNumberish,
  auraMaxSupply: BigNumberish,
  auraTotalSupply: BigNumberish,
  auraTotalCliffs: BigNumberish,
) {
  // Very small balEarned amounts can create invalid BNs with cliff/reduction
  if (balEarned.lt(1e10)) {
    return BigNumber.from(0)
  }

  const reductionPerCliff = BigNumber.from(auraReductionPerCliff)
  const maxSupply = BigNumber.from(auraMaxSupply)
  const totalSupply = BigNumber.from(auraTotalSupply)
  const totalCliffs = BigNumber.from(auraTotalCliffs)
  const minterMinted = BigNumber.from(0)

  // e.g. emissionsMinted = 6e25 - 5e25 - 0 = 1e25;
  const emissionsMinted = totalSupply.sub(maxSupply).sub(minterMinted)

  // e.g. reductionPerCliff = 5e25 / 500 = 1e23
  // e.g. cliff = 1e25 / 1e23 = 100
  const cliff = emissionsMinted.div(reductionPerCliff)

  // e.g. 100 < 500
  if (cliff.lt(totalCliffs)) {
    // e.g. (new) reduction = (500 - 100) * 2.5 + 700 = 1700;
    // e.g. (new) reduction = (500 - 250) * 2.5 + 700 = 1325;
    // e.g. (new) reduction = (500 - 400) * 2.5 + 700 = 950;
    const reduction = totalCliffs.sub(cliff).mul(5).div(2).add(700)
    // e.g. (new) amount = 1e19 * 1700 / 500 =  34e18;
    // e.g. (new) amount = 1e19 * 1325 / 500 =  26.5e18;
    // e.g. (new) amount = 1e19 * 950 / 500  =  19e17;
    let amount = balEarned.mul(reduction).div(totalCliffs)

    // e.g. amtTillMax = 5e25 - 1e25 = 4e25
    const amtTillMax = maxSupply.sub(emissionsMinted)
    if (amount.gt(amtTillMax)) {
      amount = amtTillMax
    }

    return amount
  }

  return BigNumber.from(0)
}
