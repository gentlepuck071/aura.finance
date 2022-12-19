import { BigInt } from '@graphprotocol/graph-ts'
import { Account, Pool, PoolAccount } from '../generated/schema'

export function getPoolAccount(pool: Pool, account: Account): PoolAccount {
  let id = pool.id + '.' + account.id

  let poolAccount = PoolAccount.load(id)

  if (poolAccount != null) {
    return poolAccount as PoolAccount
  }

  poolAccount = new PoolAccount(id)
  poolAccount.pool = pool.id
  poolAccount.account = account.id
  poolAccount.rewardPaid = BigInt.zero()
  poolAccount.save()

  return poolAccount as PoolAccount
}
