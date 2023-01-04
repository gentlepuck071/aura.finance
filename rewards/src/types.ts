import { BigNumber, BigNumberish } from 'ethers'
import { MerkleTree } from 'merkletreejs'

export type Options = {
  startBlock: number
  endBlock: number
  remap: string
  dropAddress: string
  verbose: boolean
  subgraph: string
}

// source => dest
export type Remapping = Record<string, string>

export type Rewards = Record<
  string,
  {
    totalAmount: BigNumber
    // pid => amount
    amountPerPool: Record<string, BigNumber>
  }
>

export type Claims = Record<string, BigNumber>

export type GlobalData = {
  auraMaxSupply: BigNumberish
  auraTotalSupply: BigNumberish
  auraTotalCliffs: BigNumberish
  auraReductionPerCliff: BigNumberish
}

export type MerkleDrop = {
  merkleTree: MerkleTree
  root: string
  total: BigNumber
  claims: Record<string, BigNumber>
}

export type Pipeline = {
  options: Options
  logger: ((...args: unknown[]) => void) & { getLogs(): string[] }
  remapping: Remapping
  globalData: GlobalData
  rewardsPaid: Rewards
  claims: Claims
  remappedClaims: Claims
  merkleDrop: MerkleDrop
}
