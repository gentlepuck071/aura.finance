import { Address } from '@graphprotocol/graph-ts'
import { Pool } from '../generated/schema'

export function getPool(address: Address, pid: string): Pool {
  let id = address.toHexString()
  let pool = Pool.load(id)

  if (pool != null) {
    return pool as Pool
  }

  pool = new Pool(id)
  pool.pid = pid
  pool.save()

  return pool as Pool
}
