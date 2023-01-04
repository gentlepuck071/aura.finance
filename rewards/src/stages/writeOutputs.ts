import { BigNumber } from 'ethers'
import fs from 'fs'
import path from 'path'
import { formatUnits, solidityKeccak256 } from 'ethers/lib/utils.js'
import { Pipeline } from '../types.js'

export async function writeOutputs(pipeline: Pipeline) {
  const {
    options: { dropAddress },
    rewardsPaid,
    logger,
    merkleDrop,
  } = pipeline

  const outputDir = path.join('ipfs', dropAddress)

  logger('Writing outputs...')

  {
    logger('Writing report...')

    const totalBAL = Object.values(rewardsPaid).reduce(
      (acc, { totalAmount }) => acc.add(totalAmount),
      BigNumber.from(0),
    )

    const totalBALPerPool = Object.fromEntries(
      Object.entries(
        Object.values(rewardsPaid)
          .map(({ amountPerPool }) => amountPerPool)
          .reduce<Record<string, BigNumber>>(
            (acc, amountPerPool) => ({
              ...acc,
              ...Object.fromEntries(
                Object.entries(amountPerPool).map(([pid, amount]) => [
                  pid,
                  amount.add(acc[pid] ?? 0),
                ]),
              ),
            }),
            {},
          ),
      ).map(([pid, amount]) => [pid, formatUnits(amount)]),
    )

    const auraPerBAL = Number(
      (
        Number(merkleDrop.total) /
        10 ** 18 /
        (Number(totalBAL) / 10 ** 18)
      ).toFixed(2),
    )

    const report = {
      root: merkleDrop.root,
      aura: {
        total: formatUnits(merkleDrop.total),
        totalExact: merkleDrop.total.toString(),
      },
      bal: {
        total: formatUnits(totalBAL),
        totalExact: totalBAL.toString(),
      },
      totalBALPerPool,
      auraPerBAL,
      claims: Object.keys(merkleDrop.claims).length,
    }
    await fs.promises.writeFile(
      path.join(outputDir, 'report.json'),
      JSON.stringify(report, null, 2),
      'utf-8',
    )
  }

  {
    logger('Writing rewards...')

    const rewardsMapped = Object.fromEntries(
      Object.entries(rewardsPaid)
        .map<[string, BigNumber]>(([account, { totalAmount }]) => [
          account,
          totalAmount,
        ])
        .sort(([, a], [, b]) => (a.lt(b) ? 1 : -1))
        .map(([account, amount]) => [account, formatUnits(amount)]),
    )

    await fs.promises.writeFile(
      path.join(outputDir, 'rewards.json'),
      JSON.stringify(rewardsMapped, null, 2),
      'utf-8',
    )
  }

  {
    logger('Writing claims...')

    const claimsWithRoot = {
      claims: Object.fromEntries(
        Object.entries(merkleDrop.claims)
          .sort(([, a], [, b]) => (a.lt(b) ? 1 : -1))
          .map(([account, amount]) => [account, formatUnits(amount)]),
      ),
      root: merkleDrop.root,
    }
    const claimsWithRootExact = {
      claims: Object.fromEntries(
        Object.entries(merkleDrop.claims)
          .sort(([, a], [, b]) => (a.lt(b) ? 1 : -1))
          .map(([account, amount]) => [account, amount.toString()]),
      ),
      root: merkleDrop.root,
    }

    await fs.promises.writeFile(
      path.join(outputDir, 'claims.json'),
      JSON.stringify(claimsWithRoot, null, 2),
      'utf-8',
    )
    await fs.promises.writeFile(
      path.join(outputDir, 'claimsExact.json'),
      JSON.stringify(claimsWithRootExact, null, 2),
      'utf-8',
    )
  }

  {
    logger('Writing proofs...')

    await fs.promises.mkdir(path.join(outputDir, 'proofs'))

    for (const [account, amount] of Object.entries(merkleDrop.claims)) {
      const leaf = solidityKeccak256(
        ['address', 'uint256'],
        [account, amount.toString()],
      )

      const proof = merkleDrop.merkleTree.getHexProof(leaf)

      await fs.promises.writeFile(
        path.join(outputDir, 'proofs', `${account}.json`),
        JSON.stringify(proof),
        'utf-8',
      )
    }
  }

  {
    logger('Writing logs...')

    await fs.promises.writeFile(
      path.join(outputDir, 'logs.txt'),
      logger.getLogs().join('\n'),
      'utf-8',
    )
  }

  logger('Done')

  return pipeline
}
