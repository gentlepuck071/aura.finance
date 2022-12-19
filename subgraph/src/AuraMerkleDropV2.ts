import {
  DaoSet,
  RootSet,
  StartedEarly,
  LockerSet,
  Claimed,
  Initialized,
} from '../generated/AuraMerkleDropV2/AuraMerkleDropV2'
import { getAccount } from './getAccount'
import { getMerkleDrop } from './getMerkleDrop'

export function handleInitialized(event: Initialized): void {
  getMerkleDrop(event.address)
}

export function handleDaoSet(event: DaoSet): void {
  let merkleDrop = getMerkleDrop(event.address)
  merkleDrop.dao = event.params.newDao
  merkleDrop.save()
}

export function handleRootSet(event: RootSet): void {
  let merkleDrop = getMerkleDrop(event.address)
  merkleDrop.merkleRoot = event.params.newRoot
  merkleDrop.save()
}

export function handleStartedEarly(event: StartedEarly): void {
  let merkleDrop = getMerkleDrop(event.address)
  merkleDrop.startTime = event.block.timestamp.toI32()
  merkleDrop.save()
}

export function handleLockerSet(event: LockerSet): void {
  let merkleDrop = getMerkleDrop(event.address)
  merkleDrop.auraLocker = event.params.newLocker
  merkleDrop.save()
}

export function handleClaimed(event: Claimed): void {
  let account = getAccount(event.params.addr)
  account.hasClaimed = true
  account.save()
}
