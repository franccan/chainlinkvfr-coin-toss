const VRFCoinToss = artifacts.require('VRFCoinToss')

module.exports = deployer => {
    deployer.deploy(VRFCoinToss)
  }