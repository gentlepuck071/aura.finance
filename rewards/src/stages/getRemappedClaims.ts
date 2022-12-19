import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils.js'
import { Claims, Pipeline } from '../types.js'

export async function getRemappedClaims(pipeline: Pipeline) {
  const { logger, claims, remapping } = pipeline

  logger('Applying remapping...')

  const remappedClaims: Claims = Object.fromEntries(
    Object.entries(claims)
      .map<[string, string, BigNumber]>(([source, amount]) => [
        remapping[source] ?? source,
        source,
        amount,
      ])
      .reduce((acc, [dest, source, amount]) => {
        const existingAmount = acc.find(([dest_]) => dest_ === dest)?.[1]

        if (dest !== source) {
          logger(`Remapped ${source} => ${dest}: ${formatUnits(amount)}`)
        }

        return [
          ...acc,
          [dest, existingAmount ? amount.add(existingAmount) : amount],
        ]
      }, []),
  )

  logger(`Remapped to ${Object.keys(remappedClaims).length} claims`)
  logger()

  return { ...pipeline, remappedClaims }
}
