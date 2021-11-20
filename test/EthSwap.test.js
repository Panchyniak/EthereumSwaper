const { assert } = require('chai');
const { default: Web3 } = require('web3');

const Token = artifacts.require('Token');
const EthSwap = artifacts.require('EthSwap');

require('chai').use(require('chai-as-promised')).should();

// Function to convert Wei representation to human readable representation.
function tokens(n) {
    // web3 library used to deal with blockchain.
    return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer, investor]) => {
    let token, ethswap

    before(async () => {
        token = await Token.new();
        ethswap = await EthSwap.new(token.address);
        /* Transfer all tokens to EthSwap */
        await token.transfer(ethswap.address, tokens('1000000'));
    })

    // Test to ensure that the smart contract was deployed to the network (using its name).
    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name();
            assert.equal(name, "DApp Token");
        })
    })

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethswap.name();
            assert.equal(name, "EthSwap Instant Exchange");
        })
    })

    // Test transfer of all the balance to ethswap account.
    it('contract has tokens', async () => {
        let balance = await  token.balanceOf(ethswap.address);
        assert.equal(balance.toString(), tokens('1000000'));
    })

    describe('Buy Tokens', async () => {
        let result;

        before(async () => {
            // "from:" is going to correspond to msg.sender.
            // "value:" is going to correspond to msg.value.
            // Purchase tokens before each example.
            result = await ethswap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether') });
        });

        it('Allows user to instantly purchase tokens from ethswap for a fixed price', async () => {
            // Check investor token balance after purchase.
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(), tokens('100'));

            // Check ethswap balance after purchase.
            let ethswapBalance = await token.balanceOf(ethswap.address);
            assert.equal(ethswapBalance.toString(), tokens('999900'));

            ethswapBalance = await web3.eth.getBalance(ethswap.address);
            assert.equal(ethswapBalance.toString(), web3.utils.toWei('1', 'ether'));

            // Inspecting the event that was emitted.
            // result.logs are the logs returned from the functio execution.
            // console.log(result.logs)
            // console.log(result.logs[0].args);
            const event = result.logs[0].args;
            
            assert.equal(event.account, investor);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens('100').toString());
            assert.equal(event.rate.toString(), '100');
        })
    })

    describe('Sell Tokens', async () => {
        let result;

        before(async () => {
            // Allowing ethswap sell tokens.
            // That means, the investor must approve before the purchase.
            await token.approve(ethswap.address, tokens('100'), { from: investor })
            // Investor sell tokens.
            result = await ethswap.sellTokens(tokens('100'), { from: investor });
        });

        it('Allows user to instantly sell tokens to ethswap for a fixed price', async () => {
            // Check investor token balance after purchase.
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(), tokens('0'));

            // Check ethswap balance after purchase.
            let ethswapBalance = await token.balanceOf(ethswap.address);
            assert.equal(ethswapBalance.toString(), tokens('1000000'));

            ethswapBalance = await web3.eth.getBalance(ethswap.address);
            assert.equal(ethswapBalance.toString(), web3.utils.toWei('0', 'ether'));

            // Inspecting the event that was emitted.
            // result.logs are the logs returned from the functio execution.
            // console.log(result.logs)
            // console.log(result.logs[0].args);
            const event = result.logs[0].args;
            
            assert.equal(event.account, investor);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens('100').toString());
            assert.equal(event.rate.toString(), '100');

            //FAILURE: investor can't sell more tokens that they have.
            await ethswap.sellTokens(tokens('500'), { from: investor }).should.be.rejected;
        })
    })
    
})

// Run "truffle test" to run tests.