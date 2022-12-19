import { Address } from '@graphprotocol/graph-ts'
import { AuraMerkleDropV2 } from '../generated/AuraMerkleDropV2/AuraMerkleDropV2'
import { MerkleDrop } from '../generated/schema'

export function getMerkleDrop(address: Address): MerkleDrop {
  let id = address.toHexString()
  let merkleDrop = MerkleDrop.load(id)

  if (merkleDrop != null) {
    return merkleDrop as MerkleDrop
  }

  let contract = AuraMerkleDropV2.bind(address)

  merkleDrop = new MerkleDrop(id)
  merkleDrop.aura = contract.aura()
  merkleDrop.auraLocker = contract.auraLocker()
  merkleDrop.dao = contract.dao()
  merkleDrop.merkleRoot = contract.merkleRoot()
  merkleDrop.deployTime = contract.deployTime().toI32()
  merkleDrop.expiryTime = contract.expiryTime().toI32()
  merkleDrop.startTime = contract.startTime().toI32()
  merkleDrop.save()

  return merkleDrop as MerkleDrop
}
