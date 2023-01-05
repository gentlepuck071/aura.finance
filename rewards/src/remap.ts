// One-off remapping of proofs files to a combined json file

import fs from 'fs'
import path from 'path'

const proofs: Record<string, string[]> = {}

const outputDir = 'ipfs/0x69a07d8a45b71e5224bb220ae8933ae8dce96b74'
const proofsFiles = await fs.promises.readdir(path.join(outputDir, 'proofs'))
const accounts = proofsFiles.map((filename) => filename.split('.')[0])

console.log(`Accounts: ${accounts.length}`)

for (const filename of proofsFiles) {
  const account = filename.split('.')[0]
  proofs[account] = JSON.parse(
    await fs.promises.readFile(
      path.join(outputDir, 'proofs', filename),
      'utf-8',
    ),
  ) as string[]
}

console.log(`Proofs accounts: ${Object.keys(proofs).length}`)

if (
  Object.keys(proofs).length !== accounts.length ||
  !Object.keys(proofs).every((account) => accounts.includes(account))
) {
  throw new Error('Proofs/accounts mismatch')
}

await fs.promises.writeFile(
  path.join(outputDir, 'proofs.json'),
  JSON.stringify(proofs, null, 0),
  'utf-8',
)
