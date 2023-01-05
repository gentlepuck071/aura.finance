import { BigNumber } from 'ethers'
import fs from 'fs'
import path from 'path'
import PinataSDK from '@pinata/sdk'
import { formatUnits, solidityKeccak256 } from 'ethers/lib/utils.js'
import { Pipeline } from '../types.js'

export async function writeOutputs(pipeline: Pipeline) {
  const {
    options: { dropAddress, uploadToIpfs },
    rewardsPaid,
    logger,
    merkleDrop,
  } = pipeline

  const pinata = new (PinataSDK as any as typeof PinataSDK['default'])(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET,
  )

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

    // Glob all proofs to reduce the number of IPFS pins required
    const proofs = Object.fromEntries(
      Object.entries(merkleDrop.claims).map(([account, amount]) => {
        const leaf = solidityKeccak256(
          ['address', 'uint256'],
          [account, amount.toString()],
        )
        const proof = merkleDrop.merkleTree.getHexProof(leaf)
        return [account, proof]
      }),
    )
    await fs.promises.writeFile(
      path.join(outputDir, `proofs.json`),
      JSON.stringify(proofs, null, 0),
      'utf-8',
    )
  }

  {
    logger('Writing logs...')

    await fs.promises.writeFile(
      path.join(outputDir, 'logs.txt'),
      logger.getLogs().join('\n'),
      'utf-8',
    )
  }

  {
    if (uploadToIpfs) {
      logger('Uploading to IPFS...')
      const resp = await pinata.pinFromFS(outputDir)
      logger(`Pinned to IPFS: ${resp.IpfsHash}`)
    } else {
      logger('Skipping IPFS upload...')
    }
  }

  logger('Done')

  return pipeline
}
