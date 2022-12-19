import { BigNumber } from 'ethers'
import { formatUnits, solidityKeccak256, keccak256 } from 'ethers/lib/utils.js'
import { MerkleTree } from 'merkletreejs'
import { MerkleDrop, Pipeline } from '../types.js'

export async function getMerkleDrop(pipeline: Pipeline) {
  const { logger, remappedClaims: claims } = pipeline

  logger('Creating Merkle drop...')

  const total = Object.values(claims).reduce(
    (acc, amount) => acc.add(amount),
    BigNumber.from(0),
  )
  logger(`Total allocation: ${formatUnits(total)} (${total.toString()})`)

  const leaves = Object.entries(claims).map(([account, amount]) =>
    solidityKeccak256(['address', 'uint256'], [account, amount.toString()]),
  )

  const merkleTree = new MerkleTree(
    leaves,
    (data: string) => keccak256(data).slice(2),
    { sort: true },
  )

  const root = merkleTree.getHexRoot()
  logger(`Root: ${root}`)

  const merkleDrop: MerkleDrop = {
    merkleTree,
    root,
    total,
    claims,
  }

  logger()

  return { ...pipeline, merkleDrop }
}
