import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Account } from '../generated/schema'

export function getAccount(address: Address): Account {
  let id = address.toHexString()

  let account = Account.load(id)

  if (account != null) {
    return account as Account
  }

  account = new Account(id)
  account.totalRewardPaid = BigInt.zero()
  account.hasClaimed = false
  account.save()
  return account as Account
}
