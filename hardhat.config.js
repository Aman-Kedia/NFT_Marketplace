require("@nomiclabs/hardhat-ethers")

require('dotenv').config({ path: __dirname + '/.env' })
const privateKey = process.env.PRIVATE_KEY
const mumbaiUrl = process.env.MUMBAI_URL

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: mumbaiUrl,
      gasPrice: 20000000000,
      gas: 6000000,
      accounts: [privateKey]
    }
  }
}
