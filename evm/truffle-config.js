const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()

const mnemonic = process.env.MNEMONIC
const url = process.env.RPC_URL

module.exports = {
  networks: {
    polygon_mumbai: {
      provider: () => {
        return new HDWalletProvider(mnemonic, url)
      },
      network_id: '80001',
      skipDryRun: true
    },
  },
  compilers: {
    solc: {
      version: '0.6.6',
    },
  },
}
