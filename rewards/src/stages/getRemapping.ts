import fs from 'fs'
import { getAddress } from 'ethers/lib/utils.js'
import { Pipeline, Remapping } from '../types.js'

export async function getRemapping(pipeline: Pipeline) {
  const { options, logger } = pipeline

  if (!options.remap) {
    logger('No remappings provided')
    return {}
  }

  const json = JSON.parse(
    await fs.promises.readFile(options.remap, 'utf-8'),
  ) as Record<string, string>

  const remapping: Remapping = Object.fromEntries(
    Object.entries(json).map(([source, dest]) => [
      getAddress(source),
      getAddress(dest),
    ]),
  )

  logger(`Using remappings:`)
  Object.entries(remapping).forEach(([source, dest]) =>
    logger(`${source} => ${dest}`),
  )

  logger()

  return { ...pipeline, remapping }
}
