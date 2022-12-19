#!/bin/node

import Mustache from 'mustache'
import fs from 'fs'

const deployments = JSON.parse(fs.readFileSync('./deployments.json', 'utf-8'))

const [networkName] = process.argv.slice(2)

if (!deployments[networkName]) {
  throw new Error(`Network ${networkName} not found`)
}

const template = fs.readFileSync('./subgraph.template.yaml', 'utf8')
fs.writeFileSync(
  './subgraph.yaml',
  Mustache.render(template, deployments[networkName]),
)
