import { DataSourceContext } from '@graphprotocol/graph-ts'
import { BoosterV1, PoolShutdown } from '../generated/BoosterV1/BoosterV1'
import { BaseRewardPool } from '../generated/templates'
import { getPool } from './getPool'

export function handlePoolShutdown(event: PoolShutdown): void {
  let boosterV1 = BoosterV1.bind(event.address)
  let poolInfo = boosterV1.poolInfo(event.params.poolId)

  let pid = event.params.poolId.toString()

  let rewardPool = poolInfo.getCrvRewards()
  getPool(rewardPool, pid)

  let context = new DataSourceContext()
  context.setString('pid', pid)
  BaseRewardPool.createWithContext(rewardPool, context)
}
