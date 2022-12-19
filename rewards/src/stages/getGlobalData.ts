// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from 'graphql-request'
import { Pipeline } from '../types.js'

export async function getGlobalData(pipeline: Pipeline): Promise<Pipeline> {
  const protocolClient = new GraphQLClient(
    'https://graph.aura.finance/subgraphs/name/aura/aura-mainnet-v2',
  )
  const { global: globalData } = await protocolClient.request<{
    global: {
      auraMaxSupply: string
      auraTotalSupply: string
      auraTotalCliffs: string
      auraReductionPerCliff: string
    }
  }>(gql`
    {
      global(id: "global") {
        auraMaxSupply
        auraTotalSupply
        auraTotalCliffs
        auraReductionPerCliff
      }
    }
  `)

  return { ...pipeline, globalData }
}
