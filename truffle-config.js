require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}


/*
// This is the main entry point for the application.
// "networks" specifies our connection to blockchain (we are using Ganache).
// "compilers" is what is going to be used do compile smart contracts.
// "contracts_directory" and "contracts_build_directory" are the directories that the contracts are going to be stored.
*/