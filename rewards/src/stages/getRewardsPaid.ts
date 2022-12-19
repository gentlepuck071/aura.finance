// noinspection GraphQLUnresolvedReference

import { BigNumber } from 'ethers'
import { getAddress } from 'ethers/lib/utils.js'
import { notNullish } from 'froebel'
import { gql, GraphQLClient } from 'graphql-request'
import { Rewards, Pipeline } from '../types.js'

export async function getRewardsPaid(pipeline: Pipeline) {
  const { options, logger } = pipeline

  logger('Getting rewards paid...')

  const client = new GraphQLClient(options.subgraph)

  // Get the total RewardPaid per user during the epoch
  async function getAccounts(block: number) {
    const queryResult = await client.request<{
      accounts: Account[]
    }>(
      gql`
        fragment AccountFields on Account {
          id
          totalRewardPaid
          poolAccounts(
            # Exclude TCR-DAI
            where: { pool_not: "0xeb21c224632d9f59214a160c21e5ba43104fb015" }
          ) {
            pool {
              pid
            }
            rewardPaid
          }
        }

        query Accounts($block: Int!) {
          accounts(first: 1000, block: { number: $block }) {
            ...AccountFields
          }
        }
      `,
      { block },
    )

    if (queryResult.accounts.length >= 1000) {
      throw new Error('Need to handle more than 1000 results')
    }

    return queryResult.accounts.map(normalizeAccount)
  }

  const startAccounts = await getAccounts(options.startBlock)
  const endAccounts = await getAccounts(options.endBlock)

  const rewardsPaid: Rewards = Object.fromEntries(
    endAccounts
      .map<[keyof Rewards, Rewards[string]] | null>((end) => {
        const start = startAccounts.find((account) => account.id === end.id)

        const rewardPaidPerPool: Record<string, BigNumber> = Object.fromEntries(
          end.poolAccounts.map<[string, BigNumber]>(
            ({ rewardPaid, pool: { pid } }) => {
              const startAmount =
                start?.poolAccounts.find((pa) => pa.pool.pid === pid)
                  ?.rewardPaid ?? 0
              return [pid, BigNumber.from(rewardPaid).sub(startAmount)]
            },
          ),
        )

        const totalRewardPaid = Object.entries(
          rewardPaidPerPool,
        ).reduce<BigNumber>(
          (acc, [, rewardPaid]) => acc.add(rewardPaid),
          BigNumber.from(0),
        )

        return [
          end.id,
          {
            totalAmount: totalRewardPaid,
            amountPerPool: rewardPaidPerPool,
          },
        ]
      })
      .filter(notNullish)
      .filter(([, { totalAmount }]) => totalAmount.gt(0)),
  )

  logger()

  return { ...pipeline, rewardsPaid }
}

function normalizeAccount({ id, ...account }: Account): Account {
  return {
    id: getAddress(id),
    ...account,
  }
}

type Account = {
  id: string
  totalRewardPaid: string
  poolAccounts: {
    pool: {
      pid: string
    }
    rewardPaid: string
  }[]
}
