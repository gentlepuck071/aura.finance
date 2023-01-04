import fs from 'fs'
import path from 'path'
import commandLineArgs from 'command-line-args'
import { Options } from '../types.js'

export async function getOptions(pipeline: {}) {
  const maybeOptions: Partial<Options> = commandLineArgs([
    { name: 'startBlock', type: Number },
    { name: 'endBlock', type: Number },
    { name: 'remap', type: String },
    { name: 'dropAddress', type: String },
    { name: 'verbose', type: Boolean, defaultValue: false },
    {
      name: 'subgraph',
      type: String,
      defaultValue:
        'https://graph.aura.finance/subgraphs/name/aura/upgrade-rewards-merkle-drop',
    },
  ])

  if (!maybeOptions.startBlock)
    throw new Error(`Required argument --startBlock`)
  if (!maybeOptions.endBlock) throw new Error(`Required argument --endBlock`)
  if (!maybeOptions.dropAddress)
    throw new Error(`Required argument --dropAddress`)

  const options = maybeOptions as Options

  const outputDir = path.join('ipfs', options.dropAddress)

  try {
    await fs.promises.rm(outputDir, { recursive: true })
  } catch {}

  await fs.promises.mkdir(outputDir, { recursive: true })

  return { ...pipeline, options }
}
