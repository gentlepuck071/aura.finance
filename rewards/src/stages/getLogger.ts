import { Pipeline } from '../types.js'

const logs: string[] = []

export function getLogger(pipeline: Pipeline): Pipeline {
  const {
    options: { verbose },
    options,
  } = pipeline

  function logger(...args: unknown[]) {
    if (verbose) console.log(...args)
    logs.push(args.map((arg) => arg.toString()).join(', '))
  }

  logger.getLogs = () => logs

  logger(`Start: ${options.startBlock}`)
  logger(`End:   ${options.endBlock}`)
  logger()

  return { ...pipeline, logger }
}
