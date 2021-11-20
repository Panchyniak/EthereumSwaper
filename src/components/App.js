import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './Navbar';
import Main from './Main';
import EthSwap from '../abis/EthSwap.json';
import Token from '../abis/Token.json';
import './App.css';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    // Import all blockchain information.
    await this.loadBlockchainData();
  }

  async loadBlockchainData(){
    const web3 = window.web3;

    // Getting accounts.
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Getting account balance.
    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });

    // Creating a javascript version of the contracts to be able to interact with them.
    // Loading Token
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];

    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({ token });

      let tokenBalance = await token.methods.balanceOf(this.state.account).call();
      this.setState({ tokenBalance });

    } else {
      window.alert('Token contract not deployed to detected network');
    }

    // Loading EthSwap
    const ethSwapData = EthSwap.networks[networkId];

    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      this.setState({ ethSwap });
    } else {
      window.alert('EthSwap contract not deployed to detected network');
    }

    this.setState( { loading: false });

  }

  // Pull the ethereum provider from metamask and expose to our application:
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      // Acccounts always exposed
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    // takes the constructor function.
    super(props);
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      tokenBalance: '0',
      ethBalance: '0',
      loading: true
    }
  }
  
  render() {
    let content;

    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p> 
    } else {
      content = <Main 
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
