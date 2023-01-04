import { pipe } from 'froebel'
import dotenv from 'dotenv'

dotenv.config()

import { getClaims } from './stages/getClaims.js'
import { getLogger } from './stages/getLogger.js'
import { getOptions } from './stages/getOptions.js'
import { getRemappedClaims } from './stages/getRemappedClaims.js'
import { getRemapping } from './stages/getRemapping.js'
import { getGlobalData } from './stages/getGlobalData.js'
import { getRewardsPaid } from './stages/getRewardsPaid.js'
import { getMerkleDrop } from './stages/getMerkleDrop.js'
import { writeOutputs } from './stages/writeOutputs.js'
import { Pipeline } from './types.js'

await pipe<[Pipeline], Pipeline>(
  getOptions,
  getLogger,
  getRemapping,
  getGlobalData,
  getRewardsPaid,
  getClaims,
  getRemappedClaims,
  getMerkleDrop,
  writeOutputs,
)({})
