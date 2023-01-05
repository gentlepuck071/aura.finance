# Aura upgrade rewards Merkle drop

Merkle drop for AURA rewards distributed after the Dec 2022 upgrade.

The Merkle drop contract is deployed [here](https://etherscan.io/address/0x69a07d8a45b71e5224bb220ae8933ae8dce96b74)

## About

This repository contains a script for calculating rewards, and a subgraph
to track those rewards.

## Subgraph

The subgraph is deployed [here](https://graph.aura.finance/subgraphs/name/aura/upgrade-rewards-merkle-drop).

## Reward epochs

The epoch script calculates the AURA rewards earned by accounts staking in
Aura's base reward pools (i.e., those which distrubute BAL only), and
creates a Merkle root hash and proofs for each account to claim the
rewards with.

A remapping feature enables rewards to be remapped from one account to
another; for example, for projects with protocol-owned liquidity wishing
to redirect all earned rewards to one multisig.

### Quickstart

#### Installation

```bash
cd rewards
pnpm install
```

#### Generating a rewards epoch

```bash
pnpm epoch --startBlock 16177665 --endBlock 16239455 --remap remap.json --outputDir drop
```

### Script arguments

- `startBlock`
  - Block number
  - Start of the rewards epoch (i.e. when the system was shut down)
- `endBlock`
  - Block number
  - End of the rewards epoch
- `remap`
  - Path to JSON file
  - Account remapping (keys to values, e.g. `{ '0xSource': '0xDestination' }`)
- `outputDir`
  - Path to output directory
  - All output files will be created here
- `verbose`
  - Boolean
  - Optional verbose logging
- `uploadToIpfs`
  - Boolean
  - Optionally upload the `ipfs` dir to IPFS

### Outputs

The script produces the following outputs:

- `report.json`
  - Report of the drop, including the total AURA and Merkle root hash
- `claims.json`
  - A mapping of accounts to claimable AURA rewards, as exact decimal strings
- `rewards.json`
  - A mapping of accounts to BAL rewards considered, as exact decimal strings
- `proofs.json`
  - For all accounts, a JSON file with all Merkle proofs
- `log.txt`
  - Log of arguments used, etc.
