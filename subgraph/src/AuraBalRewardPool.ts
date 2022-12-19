import { RewardPaid } from '../generated/templates/BaseRewardPool/BaseRewardPool'
import { getAccount } from './getAccount'
import { getPool } from './getPool'
import { getPoolAccount } from './getPoolAccount'

export function handleRewardPaid(event: RewardPaid): void {
  let account = getAccount(event.params.user)
  account.totalRewardPaid = account.totalRewardPaid.plus(event.params.reward)
  account.save()

  let pool = getPool(event.address, 'auraBal')

  let poolAccount = getPoolAccount(pool, account)
  poolAccount.rewardPaid = poolAccount.rewardPaid.plus(event.params.reward)
  poolAccount.save()
}
