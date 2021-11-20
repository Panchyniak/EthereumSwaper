/**
 * Migrations Files basically take a contract (smart contract) and put then in a blockchain. */

const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
